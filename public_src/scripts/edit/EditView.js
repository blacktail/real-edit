define([
	'lodash',
	'backbone',
	'edit/templates',
	'jquery',
	'common/utils',
	'common/PromptView'
], function(_, Backbone, templates, $, utils, PromptView) {
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
			this.socket.on('user:changed', _.bind(this.onUserChange, this));
			this.socket.on('message:new', _.bind(this.onNewMessage, this));
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
				utils.loadScript('/ace-builds-1.1.01/src-min-noconflict/ace.js', function() {
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

		onNewMessage: function (data) {
			this.$('#msgList').append(templates['edit/message'](data));

			$('.messages .always-into-view')[0].scrollIntoView();
		},

		onUserChange: function (data) {
			console.log('onUserChange: ', data);
			this.$('#usersList').html(templates['edit/users']({
				users: data
			}));

			$('.user-list .always-into-view')[0].scrollIntoView();
			$('#userNum').html(data.length);
		}
	});

	return EditView;
});
