<div id="header" class="navbar navbar-inverse navbar-fixed-top edit-header" role="banner">
	<div class="container">
		<div class="navbar-header">
			<a class="navbar-brand" href="#">RealEdit</a>
		</div>
		<div class="collapse navbar-collapse navbar-ex2-collapse">
			<button id="new" type="button" class="btn btn-default navbar-btn btn-xs">New</button>
			<a id="history" type="button" class="btn btn-default btn-xs" target="_blank" href="/history/{{fileName}}">History</a>
			<a id="download" type="button" class="btn btn-default btn-xs" target="_blank" href="/download/{{fileName}}">Download</a>
			<div class="user-info pull-right">
				<a href="#" id="userName">{{user}}</a>
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
					Users <span class="badge" id="userNum">0</span>
				</div>
				<div class="panel-body">
					<ul id="usersList">
					</ul>

					<div class="always-into-view"></div>
				</div>
			</div>

			<div class="messages panel panel-default">
				<div class="panel-heading">
					Messages
				</div>
				<div class="panel-body">
					<ul id="msgList">
					</ul>
					
					<div class="always-into-view"></div>
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
