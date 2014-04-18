$(function() {

	var Note = Backbone.Model.extend({

		defaults: function() {
			var d = new Date()

			return {
				title: "New note",
				content: "Add text here...",
				order: Notes.nextOrder(),
				colour: "#FF9",
				date: d.toDateString()
			};
		}

	});

	var NoteList = Backbone.Collection.extend({

		model: Note,

		localStorage: new Backbone.LocalStorage("sticky-notes"),

		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},

		comparator: "order"

	});

	var Notes = new NoteList;

	var NoteView = Backbone.View.extend({

		tagName: "div",

		template: _.template($('#note-template').html()),

		events: {
			"click a.destroy"         : "clear",
			"dblclick .content-view"  : "editContent",
			"keypress .content-edit"  : "updateContentOnEnter",
			"blur .content-edit"      : "closeContent",
			"dblclick .title-view"    : "editTitle",
			"keypress .title-edit"    : "updateTitleOnEnter",
			"blur .title-edit"        : "closeTitle"
		},

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
      		this.listenTo(this.model, 'destroy', this.remove);
		},

		render: function() {
			console.log(this.model.get("order"));
			this.$el.html(this.template(this.model.toJSON()));
			this.contentInput = this.$(".content-edit");
			this.titleInput = this.$(".title-edit");
			return this;
		},

		clear: function() {
			this.model.destroy();
		},

		editContent: function() {
			console.log(this.contentView);
			this.$el.addClass("editing-content");
			this.contentInput.focus();
		},

		updateContentOnEnter: function(e) {
			if (e.keyCode == 13) this.closeContent();
		},

		closeContent: function() {
			var value = this.contentInput.val();
			if(!value) {
				this.clear();
			} else {
				this.model.save({content: value});
				this.$el.removeClass("editing-content");
			}
		},

		editTitle: function() {
			this.$el.addClass("editing-title");
			this.titleInput.focus();
		},

		updateTitleOnEnter: function(e) {
			if (e.keyCode == 13) this.closeTitle();
		},

		closeTitle: function() {
			var value = this.titleInput.val();
			if(!value) {
				this.clear();
			} else {
				this.model.save({title: value});
				this.$el.removeClass("editing-title");
			}
		}

	});

	var AppView = Backbone.View.extend({

		el: $("#note-app"),

		template: _.template($('#stats-template').html()),

		events: {
			"keypress #new-note": "createOnEnter"
		},

		initialize: function() {
			this.input = this.$("#new-note");

			this.listenTo(Notes, 'add', this.addOne);
			this.listenTo(Notes, 'reset', this.addAll);
			this.listenTo(Notes, 'all', this.render);

			this.colours = this.$("#colours")
			this.footer = this.$("footer");
			this.main = $("main");

			Notes.fetch();
		},

		render: function() {
			var count = Notes.length

			if (count) {
				this.main.show();
				this.footer.show();
				this.footer.html(this.template({count: count}));
			} else {
				this.main.hide();
				this.footer.hide();
			}
		},

		addOne: function(note) {
			var view = new NoteView({model: note});
			this.$("#note-list").prepend(view.render().el);
		},

		addAll: function() {
			Notes.each(this.addOne, this);
		},
		
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			if (!this.input.val()) return;

			Notes.create({
				title: this.input.val(),
				colour: this.colours.val()
			});

			this.input.val('');
		}

	});

	var App = new AppView;

});