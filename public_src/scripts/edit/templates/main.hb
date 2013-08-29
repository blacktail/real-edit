<div id="header" class="navbar navbar-inverse navbar-fixed-top edit-header" role="banner">
	<div class="container">
		<div class="navbar-header">
			<a class="navbar-brand" href="#">RealEdit</a>
		</div>
		<div class="collapse navbar-collapse navbar-ex2-collapse">
			<button type="button" class="btn btn-default btn-xs">New</button>
			<button type="button" class="btn btn-default btn-xs">History</button>
			<button type="button" class="btn btn-default btn-xs">Download</button>
			<div class="user-info pull-right">
				<a href="#">Percy</a>
			</div>

			<div class="pro-lang pull-right">
				<span>Languages</span>
				<select id="progLang">
					<option value="c">c</option>
					<option value="cpp">c++</option>
					<option value="javascript">javascript</option>
				</select>
			</div>

			<div class="key-binding pull-right">
				<span>Key Binding</span>
				<select id="keyBinding">
					<option value="ace">ace</option>
					<option value="vim">vim</option>
					<option value="emacs">emacs</option>
					<option value="custom">custom</option>
				</select>
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
