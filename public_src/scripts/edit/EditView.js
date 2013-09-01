define([
	'lodash',
	'backbone',
	'edit/templates',
	'jquery',
	'common/utils',
	'common/PromptView',
	'dmp'
], function(_, Backbone, templates, $, utils, PromptView, Dmp) {
	var EditView = Backbone.View.extend({
		tagName: 'div',
		id: 'editPage',

		template: templates.edit,

		events: {
			'click #userName': 'changeUserName',
			'change #keyBinding': 'changeKeyBinding',
			'change #progLang': 'changeProgrammingLanguage',
			'change #editorTheme': 'changeEditorTheme',
			'keydown #message': 'chat'
		},

		initialize: function(options) {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:user', this.updateUserInfo);
			this.listenTo(this.model, 'change:language', this.updateEditorStatus);
			this.listenTo(this.model, 'change:keybindi', this.updateEditorStatus);
			this.listenTo(this.model, 'change:theme', this.updateEditorStatus);

			this.fileName = options.fileName;

			this.socket = io.connect('/');
			this.socket.on('connect', _.bind(this.onSocketConnect, this));
			this.socket.on('socket:new', _.bind(this.onSocketNew, this));
			this.socket.on('user:changed', _.bind(this.onUserChange, this));
			this.socket.on('message:new', _.bind(this.onNewMessage, this));
			this.socket.on('doc:init', _.bind(this.onDocInit, this));
			this.socket.on('doc:ack', _.bind(this.onDocAck, this));
			this.socket.on('doc:changed', _.bind(this.onDocRemoteChanged, this));
			this.socket.on('doc:sync', _.bind(this.onDocSync, this));

			this.dmp = new Dmp();

			this.opMap = {
				'insertText': 1,
				'insertLines': 1,
				'removeText': -1,
				'removeLines': -1
			};

			this.changeArr = [];
		},

		render: function(model) {
			// make only render once
			if (this.rendered) {
				return;
			}

			this.$el.html(this.template(this.model.toJSON()));

			var that = this;
			// init ace editor
			if (typeof ace == 'undefined') {
				utils.loadScript('/ace-builds-1.1.01/src-noconflict/ace.js', function() {
					that.initEditor();
				});
				
			} else {
				that.initEditor();
			}

			if (!model.get('user')) {
				this.$('#userName').html('unknown');
				this.changeUserName();
			}

			this.rendered = true;
		},

		initEditor: function () {
			window.aceEditor = this.editor = ace.edit(this.$('#editor')[0]);
			this.$('.messages .panel-body').height($(window).height() - 421);
			this.$('#editor').height($('.sidebar').height());
			
			this.updateEditorStatus();

			this.editor.focus();

			utils.loadScript('/ace-builds-1.1.01/src-min-noconflict/keybinding-emacs.js', function() {
			});
			utils.loadScript('/ace-builds-1.1.01/src-min-noconflict/keybinding-vim.js', function() {
			});

			this.editor.on('change', _.bind(this.onEditorChange, this));

			this.doc = this.editor.getSession().doc;
		},

		updateEditorStatus: function () {
			if (this.editor) {
				this.editor.setTheme(this.model.get('theme'));
				this.editor.getSession().setMode('ace/mode/' + this.model.get('language'));

				var binding = this.model.get('keybindi');
				this.editor.setKeyboardHandler(binding ? 'ace/keyboard/' + binding : null);
			}
		},

		updateUserInfo: function () {
			var userName = this.model.get('user') || 'unknown';
			this.$('#userName').html(userName);
			this.socket.emit('username:change', {
				user: userName
			});
		},

		changeUserName: function () {
			var that = this;

			new PromptView({
				title: 'RealEdit',
				prompt: 'Please enter your user name:',
				callback: function (name) {
					var oldName = that.$('#userName').html();

					that.model.set('user', name || oldName || '');

					if (name) {
						localStorage.realEditUser = name;
					}
				}
			});	
		},

		changeKeyBinding: function () {
			var keybinding = localStorage.realEditKeyBindi = this.$('#keyBinding').val();
			this.model.set('keybindi', keybinding);
		},

		changeProgrammingLanguage: function () {
			var lang = localStorage.realEditProgLang = this.$('#progLang').val();
			this.model.set('language', lang);
		},

		changeEditorTheme: function () {
			var theme = localStorage.realEditTheme = this.$('#editorTheme').val();
			this.model.set('theme', theme);
		},

		chat: function (event) {
			if (event.which == 13) {
				var msg = $.trim(this.$('#message').val());
				this.socket.emit('chat', {
					chanel: this.fileName,
					msg: msg,
					user: this.model.get('user') || 'unknown'
				});

				this.$('#message').val('');
			}
		},

		onSocketConnect: function () {
			this.socket.emit('begin', {
				chanel: this.fileName,
				user: this.model.get('user') || 'unknown'
			});
		},

		onSocketNew: function (data) {
			this.socket.id = data;
		},

		onNewMessage: function (data) {
			this.$('#msgList').append(templates['edit/message'](data));

			$('.messages .always-into-view')[0].scrollIntoView();
		},

		onUserChange: function (data) {
			this.$('#usersList').html(templates['edit/users']({
				users: data
			}));

			$('.user-list .always-into-view')[0].scrollIntoView();
			$('#userNum').html(data.length);
		},

		onEditorChange: function (event) {
			if (this.dontChange) {
				return;
			}

			var data = event.data;

			var op = this.opMap[data.action],
				mRange = this.getModifyRange(data);


			var changeData = [_.uniqueId('c'), op, mRange.start, mRange.end, mRange.text];

			this.changeArr.push(changeData);

			this.sendChange();
		},

		sendChange: function () {
			if (this.pending) {
				console.log('pending now, please wait...');
				return;
			}

			this.socket.emit('doc:change', {
				cr: this.curRevision,
				cg: this.changeArr
			});

			this.pending = true;
		},

		onDocInit: function (rev) {
			this.curRevision = rev.r;
			this.curRevText = rev.c;
			this.dontChange = true;
			this.doc.setValue(rev.c);
			this.dontChange = false;
		},

		onDocAck: function (data) {
			var canUpdateRevision = this.curRevision < data.nr && this.curRevision == data.or &&
				!data.ph;

			var changedIds = data.id,
				changeArr = this.changeArr;

			this.changeArr = _.filter(changeArr, function (change) {
				return changedIds.indexOf(change[0]) == -1;
			});

			if (canUpdateRevision) {
				console.log('update to revision: ', data.nr);
				this.curRevision = data.nr;
				this.curRevText = utils.merge(this.curRevText, data.cg);
			}

			this.pending = false;

			if (this.changeArr.length > 0) {
				this.sendChange();
			}
		},

		onDocRemoteChanged: function (data) {
			if (data.fr == this.socket.id) {
				return;
			}

			var newRevision = data.nr,
				baseRevision = data.or,
				changes = data.cg,
				patches = data.ph,
				curRevision = this.curRevision;

			if (curRevision == newRevision) {
				console.log('already newest');
			} else if (curRevision < newRevision && curRevision == baseRevision) {
				console.log('can merge');
				var text = this.doc.getValue(),
					newText = text;
				this.dontChange = true;

				if (patches)  {
					newText = this.dmp.patch_apply(patches, text)[0];
				} else {
					newText = utils.merge(text, changes);
				}

				this.doc.setValue(newText); //todo, need optimization
				this.dontChange = false;
				this.curRevision = newRevision;
			} else if (curRevision > newRevision) {
				// throw new Error('unexcepted error occurs');
				console.log('old revision arrived, ignore that');
			} else { // current revision is behind of baseRevision many revsions, should sync latest Revision
				this.syncLatestRevision();
				console.log('need sync');
			}
		},

		syncLatestRevision: function () {
			this.socket.emit('doc:needSync', this.curRevision);
		},

		onDocSync: function (data) {
			console.log('doc sync: ', data);
			var revs = data.rs,
				baseText = this.curRevText,
				baseRevId = this.curRevision;

			if (baseRevId != data.or) {
			//	return;
			}

			this.dontChange = true;

			_.each(revs, function (rev) {
				console.log('rev: ', rev);
				if (rev.r > baseRevId) {
					if (rev.p) {
						baseText = this.dmp.patch_apply(rev.g, baseText)[0];
					} else {
						baseText = utils.merge(baseText, rev.g);
					}
				}
			}, this);

			console.log('newText: ', baseText);

			this.doc.setValue(baseText);

			this.dontChange = false;
		},

		getModifyRange: function (change) {
			var start = this.doc.positionToIndex(change.range.start),
				end = start,
				text = '',
				nl = this.doc.getNewLineCharacter();

			if (change.action == 'removeLines' || change.action == 'insertLines') {
				var nlNums = change.lines.length * nl.length,
					textNums = 0;
					_.each(change.lines, function (line) {
						textNums += line.length;
						text += line + nl;
					});


				end = start + textNums + nlNums;
			} else {
				end = start + change.text.length;
				text = change.text;
			}

			return {
				start: start,
				end: end,
				text: text
			};
		}
	});

	return EditView;
});
