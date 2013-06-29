/**
 * @module excel
 */
define(['jquery', 'config'], function ($, config) {

	/**
	 * スプレッドシートViewクラス
	 *
	 * @class View
	 * @constructor
	 */
	var View = function (options) {
		this.$textarea = null;
		this.$table = null;
		this.selectStartCellPos = '';
		this.selectEndCellPos   = '';
		this.lastCellPos = [0,0];
		this.selectionData = [[]];
		this.$selectionArea = null;
		this.$selectionBorder = {top: null, bottom: null, left: null, right: null};
		this.$selectionHandle = null;
		this.canvasId = '#' + config.view.CANVAS_ID;
		this.$canvas = null;
		this.containerId = '#' + config.view.CONTAINER_ID;
		this.$container = null;
		this.observers = [];
		this.defaults = {
			cellTypeDefinition: {}
		};
		this.settings = $.extend(this.defaults, options);

		this._init();
	};

	View.prototype = {

		/**
		 * @method _init
		 * @private
		 * @param {Array} data
		 */
		_init: function (data) {
			// canvas
			this.$container = $(this.containerId);
			this.$canvas = $(this.canvasId);

			// selected area
			this.$selectionArea = $('<div>').attr('class', config.cls.SELECTION_AREA).appendTo(this.$canvas);

			// selected border
			this.$selectionBorder = {
				top    : $('<div>').attr('class', config.cls.SELECTION_BORDER).appendTo(this.$selectionArea),
				bottom : $('<div>').attr('class', config.cls.SELECTION_BORDER).appendTo(this.$selectionArea),
				left   : $('<div>').attr('class', config.cls.SELECTION_BORDER).appendTo(this.$selectionArea),
				right  : $('<div>').attr('class', config.cls.SELECTION_BORDER).appendTo(this.$selectionArea)
			};

			// selected handle 
			this.$selectionHandle = $('<div>').attr('class', config.cls.SELECTION_HANDLE).appendTo(this.$selectionArea);

			// textarea
			this.$textarea = $('<textarea>').attr('id', 'excel_edit_area').attr(config.attr.CELL_ID,'0:0').appendTo(this.$canvas);

			//table
			this.$table = $('<table>').attr('id', 'excel_table').appendTo(this.$canvas);
		},

		/**
		 * 描画エリアをemptyにする
		 *
		 * @method destroy
		 */
		destroy: function () {
			this.$canvas.empty();
		},

		/**
		 * 編集開始
		 * テキストエリアを表示
		 *
		 * @method startEditing
		 * @param {Boolean} isVisible
		 */
		startEditing: function (isVisible) {
			var $cell = this.$table.find('.' + config.cls.SELECTED);
			if (!$cell.hasClass(config.cls.EDITING)) {
				$('.' + config.cls.EDITING).removeClass(config.cls.EDITING);

				this.$textarea
					.css({
						top     : $cell.offset().top - this.$canvas.offset().top,
						left    : $cell.offset().left - this.$canvas.offset().left,
						width   : $cell.width() + 4,
						height  : $cell.height() + 4,
						opacity : isVisible === 0 ? 0 : 1
					})
					.attr(config.attr.CELL_ID, $cell.attr(config.attr.CELL_ID))
					.val($cell.find('.cell_val').html())
					.addClass(config.cls.EDITING)
					.focus()
					.select();
			}
		},

		/**
		 * 編集終了
		 * テキストエリアを非表示
		 *
		 * @method finishEditing
		 */
		finishEditing: function () {
			$('.' + config.cls.EDITING).removeClass(config.cls.EDITING);
			if (this.$textarea) {
				this.$textarea.removeAttr('style');
			}
		},

		/**
		 * viewを更新
		 *
		 * @method update
		 * @param {Array} data
		 * @param {Array} data2
		 */
		update: function () {
			if (arguments.length === 1) {
				if ($.isArray(arguments[0])) {
					this.renderTable(arguments[0]);
				} else { 
					
					// 引数が文字列の場合はアラートする
					alert(arguments[0]);
				}
			} else { 
				this.renderTableDiff(data, data2);
			}
		},

		/**
		 * テーブルを描画
		 *
		 * @method renderTable
		 * @param {Array} data
		 */
		renderTable: function (data) {
			if (this.$table.find('tr').length === 0) {

				// 初回
				this.buildTable(data);

				// 左上のセルを選択状態にする
				$('td[' + config.attr.CELL_ID + '="0:0"]').addClass(config.cls.SELECTED);
				this.lastCellPos = [data.length - 1, data[0].length - 1];
			} else if(
				typeof data[this.lastCellPos[0]] === undefined ||
				typeof data[0][this.lastCellPos[1]] === undefined
			) {
				// 元データよりサイズが大きい場合
				this.buildTable(data);
				this.lastCellPos = [data.length - 1, data[0].length - 1];
			} else { 
				// テーブル生成済み
				for (var i = 0, lenRow = data.length; i < lenRow; i++) {
					var $tr = this.$table.find('tr').eq(i);
					for (var j = 0, lenCol = data[i].length; j < lenCol; j++) {
						$tr.find('.cell_val').eq(j).html(data[i][j]);
					}
				}
				this.finishEditing();
			}
			this.notify('renderTable');
		},

		/**
		 * テーブルを差分のみ描画
		 *
		 * @method renderTableDiff
		 * @param {Array} data
		 * @param {Array} data2
		 */
		renderTableDiff: function (data, data2) {
			if (this.$table.find('tr').length == 0) {
				// 初回のみテーブルを生成
				this.buildTable(data);
				// 左上のセルを選択状態にする
				$('td[' + config.attr.CELL_ID + '="0:0"]').addClass(config.cls.SELECTED);
				this.lastCellPos = [data.length - 1, data[0].length - 1];

			} else { 
				// テーブル生成済み
				for (var i = 0, lenRow = data.length; i < lenRow; i++) {
					var $tr = this.$table.find('tr').eq(i);
					for (var j = 0, lenCol = data[i].length; j < lenCol; j++) {
						$tr.find('.cell_val').eq(j).html(data[i][j]);
						if (data[i][j] != data2[i][j]) {
							$tr.find('.cell_val').eq(j).addClass('modified');
						}
					}
				}
				this.finishEditing();
			}
			this.notify('renderTable');
		},

		/**
		 * テーブルを生成
		 *
		 * @method buildTable
		 * @param {Array} data
		 */
		buildTable: function (data) {
			var $thead = null;
			this.$table.empty();

			for (var i = 0, lenRow = data.length; i < lenRow; i++) {
				var $tr = $('<tr>'),
					$td = null, $th = null;

				if ($.isArray(data[i])) {
					for (var j = 0, lenCol = data[i].length; j < lenCol; j++) {
						$td = $('<td>')
							.attr(config.attr.CELL_ID, i + ':' + j)
							.append($('<span class="cell_val">').html(data[i][j]))
							.append($('<span class="ta_holder">'));

						if ($thead) {
							// disabledはカラム単位、各セルにクラス付与
							if ($thead.find('td').eq(j).hasClass(config.cls.DISABLED)) {
								$td.addClass(config.cls.DISABLED);
							}
						}
						$tr.append($td);
					}
					this.$table.append($tr);

					if (!$thead) {
						for (var j = 0, lenCol = data[i].length; j < lenCol; j++) {
							$th = $tr.find('td').eq(j);
							for (var sizeKey in this.settings.cellTypeDefinition) {
								if (new RegExp(this.settings.cellTypeDefinition[sizeKey].join('|')).test($th.html())) {
									$th.addClass(sizeKey);
								}
							}
							if ($th.html() == '') {
								$th.addClass(sizeKey);
							}

							/**
							 * TODO
							 */
							// $th.find('.cell_val').append($('<input type="checkbox">'))
						}
						$thead = this.$table.find('tr').eq(0).addClass('thead');
					}
				} else { 
					
					$td = $('<td>')
						.attr(config.attr.CELL_ID, i + ':' + 0)
						.append($('<span class="cell_val">').html(data[i]))
						.append($('<span class="ta_holder">'));

					if ($thead) {
						// disabledはカラム単位、各セルにクラス付与
						if ($thead.find('td').hasClass(config.cls.DISABLED)) {
							$td.addClass(config.cls.DISABLED);
						}
					}
					$tr.append($td);
					this.$table.append($tr);

					if (!$thead) {
						$th = $tr.find('td');
						for (var sizeKey in this.settings.cellTypeDefinition) {
							if (new RegExp(this.settings.cellTypeDefinition[sizeKey].join('|')).test($th.html())) {
								$th.addClass(sizeKey);
							}
						}
						if ($th.html() == '') {
							$th.addClass(sizeKey);
						}

						$thead = this.$table.find('tr').eq(0).addClass('thead');
					}
				}
			}
		},

		/**
		 * 選択セルを描画
		 *
		 * @method renderActiveUniqCell
		 * @param {Array} pos [x, y]
		 * @param {Boolean} scrollTo
		 */
		renderActiveUniqCell: function (pos, scrollTo) {
			if (typeof scrollTo == 'undefined') {
				scrollTo = true;
			}
			var strPos = pos.join(':'),
				$td;
			
			this.selectStartCellPos = $.extend([], pos);
			this.selectEndCellPos   = $.extend([], pos);
			this.$textarea.attr(config.attr.CELL_ID, strPos);

			$('.' + config.cls.SELECTED).removeClass(config.cls.SELECTED);
			$td = $('td[' + config.attr.CELL_ID + '="'+strPos+'"]').addClass(config.cls.SELECTED);
			this.selectionData = [[$td.find('.cell_val').html()]];

			var cellW = $td.width(),
				cellH = $td.height();

			this.$selectionArea.css({
				top: $td.offset().top - this.$canvas.offset().top,
				left: $td.offset().left - this.$canvas.offset().left
			});
			this._renderSelectionBorder(cellW, cellH);
			this._renderHandle(cellW, cellH);

			var top = $td.offset().top,
				left = parseInt(this.$selectionArea.css('left'));

			if (scrollTo) {
				this.$container.scrollTop(top + this.$container.scrollTop() - this.$container.offset().top);
				if (left + $td.width() > $(window).width()) {
					this.$container.scrollLeft(left + $td.width() - $(window).width() + 30);
				} else { 
					this.$container.scrollLeft(0);
				}
			}
		},

		/**
		 * 選択エリアを描画
		 *
		 * @method renderSelectionArea
		 * @param {Array} startPos
		 * @param {Array} endPos
		 */
		renderSelectionArea: function (startPos, endPos) {
			var posS     = startPos,
				posE     = endPos,
				startY   = Math.min(posS[0],posE[0]),
				endY     = Math.max(posS[0],posE[0]),
				startX   = Math.min(posS[1],posE[1]),
				endX     = Math.max(posS[1],posE[1]),
				tmpData  = [];

			$('.' + config.cls.SELECTED).removeClass(config.cls.SELECTED);

			for (var i = startY, lenRow = endY; i <= lenRow; i++) {
				tmpData.push([]);
				for (var j = startX, lenCol = endX; j <= lenCol; j++) {
					$('td[' + config.attr.CELL_ID + '="'+i+':'+j+'"]').addClass(config.cls.SELECTED);
					tmpData[tmpData.length-1].push($('td[' + config.attr.CELL_ID + '="'+i+':'+j+'"] .cell_val').html());
				}
			}

			var $cellF = this.getSelectedFirstCell(),
				$cellL = this.getSelectedLastCell(),
				areaHeight = $cellL.offset().top + $cellL.height() - $cellF.offset().top,
				areaWidth  = $cellL.offset().left + $cellL.width() - $cellF.offset().left;

			this.$selectionArea.css({
				top    : $cellF.offset().top - this.$canvas.offset().top,
				left   : $cellF.offset().left - this.$canvas.offset().left,
				width  : $cellF.width(),
				height : $cellF.height()
			});
			this._renderSelectionBorder($cellF.width(), $cellF.height());
			this._renderHandle(areaWidth, areaHeight);
			this.selectionData = tmpData;
		},

		/**
		 * 選択範囲のボーダー描画
		 *
		 * @method _renderSelectionBorder
		 * @private
		 * @param {int} width
		 * @param {int} height
		 */
		_renderSelectionBorder: function (width, height) {
			var w = width + 1,
				h = height + 1;

			this.$selectionBorder.top.css({
				top   : '0px',
				left  : '0px',
				width : w
			});
			this.$selectionBorder.bottom.css({
				top   : h,
				left  : '0px',
				width : w
			});
			this.$selectionBorder.left.css({
				top    : '0px',
				left   : '0px',
				height : h
			});
			this.$selectionBorder.right.css({
				top    : '0px',
				left   : w,
				height : h
			});
		},

		/**
		 * ハンドルを描画
		 *
		 * @method _renderHandle
		 * @private
		 * @param {int} selectionWidth
		 * @param {int} selectionHeight
		 */
		_renderHandle: function (selectionWidth, selectionHeight) {
			this.$selectionHandle.css({
				top  : selectionHeight + 1 - this.$selectionHandle.height() + 1,
				left : selectionWidth + 1 - this.$selectionHandle.width() + 2
			});
		},

		/**
		 * 選択中のデータを取得
		 *
		 * @method getSelectedData
		 * @return {Array} this.selectionData
		 */
		getSelectedData: function () {
			return this.selectionData;
		},

		/**
		 * 選択範囲の左上のセルを取得
		 *
		 * @method getSelectedFirstCell
		 * @return {DomElement} 
		 */
		getSelectedFirstCell: function () {
			return this.$table.find('.' + config.cls.SELECTED).eq(0);
		},

		/**
		 * 選択範囲の右下のセルを取得
		 *
		 * @method getSelectedLastCell
		 * @return {DomElement} 
		 */
		getSelectedLastCell: function () {
			return this.$table.find('.' + config.cls.SELECTED).last();
		},

		/**
		 * 選択範囲の左上のセルの座標を取得
		 *
		 * @method getSelectedFirstPos
		 * @return {Array} [row, column]
		 */
		getSelectedFirstPos: function () {
			var pos = this.getSelectedFirstCell().attr(config.attr.CELL_ID).split(':');
			return [parseInt(pos[0]), parseInt(pos[1])];
		},

		/**
		 * 選択範囲の右下のセルの座標を取得
		 *
		 * @method getSelectedLastPos
		 * @return {Array} [row, column]
		 */
		getSelectedLastPos: function () {
			var pos = this.getSelectedLastCell().attr(config.attr.CELL_ID).split(':');
			return [parseInt(pos[0]), parseInt(pos[1])];
		},

		/**
		 * オブザーバーに通知
		 *
		 * @method notify
		 * @param {String} name
		 */
		notify: function (name) {
			for (var i = 0, len = this.observers.length; i < len; i++) {
				if (this.observers[name]) {
					this.observers[name]();
				}
			}
		},

		/**
		 * オブザーバーを追加
		 *
		 * @method addObserver
		 * @param {Object} observer
		 */
		addObserver: function (observer) {
			this.observers.push(observer);
		}
	};

	return View;
});
