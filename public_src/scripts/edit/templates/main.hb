<div id="header" class="navbar navbar-inverse navbar-fixed-top edit-header" role="banner">
	<div class="container">
		<div class="navbar-header">
			<a class="navbar-brand" href="#">RealEdit</a>
		</div>
		<div class="collapse navbar-collapse navbar-ex2-collapse">
			<button type="button" class="btn btn-default navbar-btn btn-xs">New</button>
			<button type="button" class="btn btn-default btn-xs">History</button>
			<button type="button" class="btn btn-default btn-xs">Download</button>
			<div class="user-info pull-right">
				<a href="#" id="userName">{{username}}</a>
			</div>

			<div class="pro-lang pull-right">
				<span>Languages</span>
				{{#select language id="progLang"}}
					{{> common/languages}}
				{{/select}}
			</div>

			<div class="key-binding pull-right">
				<span>Key Binding</span>
				{{#select keybindi id="keyBinding"}}
					{{> common/keybindings}}
				{{/select}}
			</div>

			<div class="editor-theme pull-right">
				<span>Theme</span>
				{{#select theme id="editorTheme"}}
					{{> common/themes}}
				{{/select}}
			</div>
        </div>

		
	</div>
</div>

<div id="editCon" class="container">
	<div class="clearfix row" style="position:relative">
		<div class="sidebar col-xs-3">
			<div class="user-list panel panel-default">
				<div class="panel-heading">
					Users
				</div>
				<div class="panel-body">
					<ul id="usersList">
					</ul>
				</div>
			</div>

			<div class="messages panel panel-default">
				<div class="panel-heading">
					Messages
				</div>
				<div class="panel-body">
					<ul id="msgList">
					</ul>
				</div>
			</div>

			<div class="chat-con panel panel-default">
				<div class="panel-heading">
					Chat
				</div>
				<div class="panel-body">
					<input id="message" type="text" class="form-control">
				</div>
			</div>
		</div>
		<div id="editor" class="col-xs-9"></div>
	</div>
</div>
