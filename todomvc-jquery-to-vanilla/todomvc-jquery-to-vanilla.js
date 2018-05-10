/*global Handlebars, Router */
(function () {
  'use strict';

  Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;
  var todoUL = document.querySelector('#todo-list');

  var util = {
    uuid: function () {
      /*jshint bitwise:false */
      var i, random;
      var uuid = '';

      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }

      return uuid;
    },
    pluralize: function (count, word) {
      return count === 1 ? word : word + 's';
    },
    store: function (namespace, data) {
      if (arguments.length > 1) {
        return localStorage.setItem(namespace, JSON.stringify(data));
      } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    },
    jqueryToggle: function (selector, condition) {
      condition ? selector.style.display = 'block' : selector.style.display = 'none';
    }
  };

  var App = {
    init: function () {
      this.todos = util.store('todos-jquery');
      this.todoTemplate = Handlebars.compile(document.querySelector('#todo-template').innerHTML);
      this.footerTemplate = Handlebars.compile(document.querySelector('#footer-template').innerHTML);
      this.bindEvents();

      new Router({
        '/:filter': function (filter) {
          this.filter = filter;
          this.render();
        }.bind(this)
      }).init('/all');
    },
    bindEvents: function () {
      document.querySelector('#new-todo').addEventListener('keyup', this.create.bind(this));
      document.querySelector('#toggle-all').addEventListener('change', this.toggleAll.bind(this));
      document.querySelector('#footer').addEventListener('click', function(e) {
        if (e.target.id === 'clear-completed') {
          App.destroyCompleted();
        } 
      }); 
      todoUL.addEventListener('change', function(e) {
        if (e.target.classList.contains('toggle')) {
          App.toggle(e);
        } 
      }); 
      todoUL.addEventListener('dblclick', function(e) {
        if (e.target.nodeName === 'LABEL') {
          App.edit(e);
        } 
      }); 
      todoUL.addEventListener('keyup', function(e) {
        if (e.target.classList.contains('edit')) {
          App.editKeyup(e);
        } 
      }); 
      todoUL.addEventListener('focusout', function(e) {
        if (e.target.classList.contains('edit')) {
          App.update(e);
        } 
      }); 
      todoUL.addEventListener('click', function(e) {
        if (e.target.classList.contains('destroy')) {
          App.destroy(e);
        } 
      }); 
    },
    render: function () {
      var todos = this.getFilteredTodos();
      todoUL.innerHTML = this.todoTemplate(todos);
      util.jqueryToggle(document.querySelector('#main'), (todos.length > 0));
      document.querySelector('#toggle-all').checked = (this.getActiveTodos().length === 0);
      this.renderFooter();
      document.querySelector('#new-todo').focus();
    },
    renderFooter: function () {
      var todoCount = this.todos.length;
      var activeTodoCount = this.getActiveTodos().length;
      var template = this.footerTemplate({
        activeTodoCount: activeTodoCount,
        activeTodoWord: util.pluralize(activeTodoCount, 'item'),
        completedTodos: todoCount - activeTodoCount,
        filter: this.filter
      });

      util.jqueryToggle(document.querySelector('#footer'), (todoCount > 0));
      document.querySelector('#footer').innerHTML = template;
    },
    storeTodos: function() {
      util.store('todos-jquery', this.todos);
    },
    toggleAll: function (e) {
      var isChecked = e.target.checked;

      this.todos.forEach(function (todo) {
        todo.completed = isChecked;
      });

      this.render();
      this.storeTodos();
    },
    getActiveTodos: function () {
      return this.todos.filter(function (todo) {
        return !todo.completed;
      });
    },
    getCompletedTodos: function () {
      return this.todos.filter(function (todo) {
        return todo.completed;
      });
    },
    getFilteredTodos: function () {
      if (this.filter === 'active') {
        return this.getActiveTodos();
      }

      if (this.filter === 'completed') {
        return this.getCompletedTodos();
      }

      return this.todos;
    },
    destroyCompleted: function () {
      this.todos = this.getActiveTodos();
      this.filter = 'all';
      this.render();
      this.storeTodos();
    },
    // accepts an element from inside the `.item` div and
    // returns the corresponding index in the `todos` array
    indexFromEl: function (el) {
      var id;
      var todos = this.todos;
      var i = todos.length;
      
      if (el.classList.contains('toggle')) {
        id = el.parentNode.parentNode.getAttribute('data-id');
      } else {
        id = el.parentNode.getAttribute('data-id');
      }

      while (i--) {
        if (todos[i].id === id) {
          return i;
        }
      }
    },
    create: function (e) {
      var input = e.target;
      var val = input.value.trim();

      if (e.which !== ENTER_KEY || !val) {
        return;
      }

      this.todos.push({
        id: util.uuid(),
        title: val,
        completed: false
      });

      input.value = '';

      this.render();
      this.storeTodos();
    },
    toggle: function (e) {
      var i = this.indexFromEl(e.target);
      this.todos[i].completed = !this.todos[i].completed;
      this.render();
      this.storeTodos();
    },
    edit: function (e) {
      e.target.parentNode.parentNode.classList.add('editing');
      var input = e.target.parentNode.parentNode.querySelector('.edit');
      input.focus();
    },
    editKeyup: function (e) {
      if (e.which === ENTER_KEY) {
        e.target.blur();
      }

      if (e.which === ESCAPE_KEY) {
        e.target.abortEditing = true;
        e.target.blur();
      }
    },
    update: function (e) {
      var el = e.target;
      var val = el.value.trim();

      if (!val) {
        this.destroy(e);
        return;
      }

      if (el.abortEditing) {
        el.abortEditing = false;
      } else {
        this.todos[this.indexFromEl(el)].title = val;
      }

      this.render();
      this.storeTodos();
    },
    destroy: function (e) {
      this.todos.splice(this.indexFromEl(e.target), 1);
      this.render();
      this.storeTodos();
    }
  };

  App.init();
})();