/**
 * @module excel
 */

/*
 * TODO 
 * ロック状態を作る
 */
define(['jquery', 'config', 'util', 'view', 'model', 'state_context'], function ($, config, util, View, Model, StateContext) {
	
	/**
	 * スプレッドシートControllerクラス
	 *
	 * @class Controller
	 * @constructor
	 * @param {Object} options
	 * @example
	  new Controller({
	    // case: init with url
	    url: '/path/to/api',

	    // case: init with sheet size 
	    size: [{row count}, {column count}],

	    // case: init with data 
	    data: {items: [
	      ['a', 'b'],
	      ['', 'c']
	    ]}
	  });
	 */
	var Controller = function (options) {
		this.model = null;
		this.view = null;
		this.clipboard = window.clipboard = {id: null, data: null};
		this.defaults = {
			url          : '',
			size         : '',
			data         : '',
			maxUndoStack : 50
		};
		this.settings = $.extend(this.defaults, options);

		this._init();
	};

	Controller.prototype = {
		
		/**
		 * @method _init
		 * @private
		 */
		_init: function () {
			var self = this;
			this.view = new View(config.view);
			this.model = new Model({
				url          : this.settings.url,
				size         : this.settings.size,
				data         : this.settings.data,
				maxUndoStack : this.settings.maxUndoStack
			});
			this.model.setView(this.view);
			this.model.fetchData(function () {
				self._initTextarea();
				self._setKeyActions();
				StateContext.transState('normal_state', self.view);
			});
		},

		/**
		 * 初期状態に戻す（クリップボード、view、イベント）
		 *
		 * @method destroy
		 */
		destroy: function () {
			window.clipboard = {id: null, data: null};
			$(document).unbind(config.event.NAMESPACE);
			this.view.destroy();
		},

		/**
		 * 編集に使用するテキストエリアを初期化する
		 *
		 * @method _initTextarea
		 * @private
		 */
		_initTextarea: function () {
			var self = this;
			this.view.$textarea
				.bind('hide' + config.event.NAMESPACE, function (e) {
					var text   = $(this).val().replace("\n", " ").replace("\r", " "),
						offset = $(this).attr(config.attr.CELL_ID).split(':'),
						data   = [[text]];

					self.model.setData(data, offset);
				})
				.bind('copy' + config.event.NAMESPACE, function (e) {
					e.stopPropagation();
				})
				.bind('cut' + config.event.NAMESPACE, function (e) {
					e.stopPropagation();
				})
				.bind('paste' + config.event.NAMESPACE, function (e) {
					if (StateContext.state.toString() === 'EditState') return;
					e.stopPropagation();

					(function ($textarea, self) {
						setTimeout(function() {
							var text = $textarea.val(),
								data = [],
								offset = [0,0];
 
							if (text == self.clipboard.id) {
								offset = $('.' + config.cls.SELECTED).attr(config.attr.CELL_ID).split(':');
								data = $.extend(true, [], self.clipboard.data);

							} else { 
								var lineArr,
									lines = text.split(/[\r\n]+/g),
									i, j, cells;

								offset = $textarea.attr(config.attr.CELL_ID).split(':');

								if (lines[1]) {
									// 縦横・縦複数セル
									for (i = 0, len = lines.length; i < len; i++) {
										cells = lines[i].split('\t');
										lineArr = [];

										for (j = 0, lenCells = cells.length; j < lenCells; j++) {
											lineArr.push(cells[j]);
										}
										data.push(lineArr);
									}

								} else { 
									// 横複数・単独セル
									cells = text.split('\t');
									lineArr = [];

									for (j = 0, lenCells = cells.length; j < lenCells; j++) {
										lineArr.push(cells[j]);
									}
									data.push(lineArr);
								}

								$textarea.val(data[0][0]);
							}

							// check disabled
							for (var i = 0, lenRow = data.length; i < lenRow; i++) {
								for (var j = 0, lenCol = data[i].length; j < lenCol; j++) {
									if (self.view.$canvas.find('tr:nth-child('+ (i + 1 + parseInt(offset[0])) +') td:nth-child('+ (j + 1 + parseInt(offset[1])) +')').hasClass(config.cls.DISABLED)) {

										// 編集不可セルのデータはundefinedにする
										data[i][j] = void(0);
									}
								}
							}
							self.model.setData(data, offset);
						}, 0);
					})($(this), self);
				});
		},
		
		/**
		 * キーイベントをbind
		 *
		 * @method _setKeyActions
		 * @private
		 */
		_setKeyActions : function () {
			var self = this;
			$(document)
				.bind('keydown' + config.event.NAMESPACE, function (e) {
					StateContext.state.keydown(e);
				})
				.bind('keyup' + config.event.NAMESPACE, function (e) {
					StateContext.state.keyup(e);
				})
				.bind('mouseup' + config.event.NAMESPACE, function (e) {
					StateContext.state.mouseup(e);
				})
				.bind('delete' + config.event.NAMESPACE, function (e) {
					var offset = self.view.getSelectedFirstPos(),
						data = self.view.getSelectedData(),
						i, j, lenRow, lenCol;

					for (i = 0, lenRow = data.length; i < lenRow; i++) {
						for (j = 0, lenCol = data[i].length; j < lenCol; j++) {
							if (!self.view.$canvas.find('tr:nth-child('+ (i + 1 + offset[0]) +') td:nth-child('+ (j + 1 + offset[1]) +')').hasClass(config.cls.DISABLED)) {

								// 編集不可セル以外はデータを削除
								data[i][j] = '';
							}
						}
					}
					self.model.setData(data, offset);
				})
				.bind('reload' + config.event.NAMESPACE, function (e) {
					var currentData = self.model.getData(),
						initialData = self.model.getInitialData();

					if (!util.checkArrayEquality(currentData, initialData)) {
						var ret = window.confirm('編集途中のデータは失われます。よろしいですか？');
						if (ret) {
							location.reload();
						}
					} else { 
						location.reload();
					}

				})
				.bind('undo' + config.event.NAMESPACE, function (e) {
					self.model.undo();
				})
				.delegate('.thead input[type=checkbox]', 'click' + config.event.NAMESPACE, function (e) {
					if ($(this).attr('checked', 'checked')) {
						$(this).addClass(config.cls.HIDDEN)
					}

					var hiddenIndexes = [];
					self.view.$canvas.find('.thead').find('input[type=checkbox]').each(function (i, elem) {
						if ($(this).hasClass(config.cls.HIDDEN)) {
							hiddenIndexes.push(i);
						}
					});

					if (hiddenIndexes.length > 0) {
						self.model.setClippedData(hiddenIndexes);
					}
				});

			this.view.$canvas
				.delegate('td, .selection_area', 'mousedown' + config.event.NAMESPACE, function (e) {
					StateContext.state.click(e, $(this));
					StateContext.state.mousedown(e);
				})
				.delegate('td', 'mousemove' + config.event.NAMESPACE, function (e) {
					StateContext.state.mousemove(e, $(this));
				});
		},
		
		/**
		 * modelからデータを取得
		 * ２次元配列のシートデータ
		 *
		 * @method getData
		 * @return {Array} data
		 */
		getData: function () {
			var data = this.model.getData();
			return data;
		}
	};

	return Controller;
});
