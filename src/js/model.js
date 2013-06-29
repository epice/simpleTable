/**
 * @module excel
 */
define(['jquery'], function ($) {

	/**
	 * @class DataModel
	 * @constructor
	 * @param {Object} options
	 * @example
	  new DataModel({
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
	var DataModel = function (options) {
		this.data           = [];
		this.initialData    = [];
		this.clippedData    = null;
		this.visibleIndexes = null;
		this.hiddenIndexes  = null;
		this.defaultIndexes = null;
		this.view           = null;
		this.undoDataStack  = [];
		this.undoFlag       = false;
		this.defaults       = {
			url          : '',
			size         : '',
			data         : '',
			maxUndoStack : 50
		};
		this.settings = $.extend(this.defaults, options);

		this._init();
	};

	DataModel.prototype = {

		/**
		 * @method _init
		 * @private
		 */
		_init: function () {
		},

		/**
		 * viewをセットする
		 *
		 * @method setView
		 * @param {Object} view
		 */
		setView: function (view) {
			this.view = view;
		},

		/**
		 * データを取得、シートを初期化する
		 *
		 * @method fetchData
		 * @param {Function} callback
		 */
		fetchData: function (cb) {
			if (this.settings.size) {
				this._initSheetWithSize(this.settings.size, cb);
			} else if (this.settings.data) {
				this._initSheetWithData(this.settings.data, cb);
			} else if (this.settings.url) { 
				this._initSheetWithUrl(this.settings.url, cb);
			} else { 

				// フォールバック
				// 10 x 4 でシート生成
				this._initSheetWithSize([10, 4], cb);
			}
		},

		/**
		 * 指定サイズでシートを生成
		 *
		 * @method _initSheetWithSize
		 * @private
		 * @param {Array} size [{row count}, {column count}]
		 * @param {Function} callback
		 */
		_initSheetWithSize: function (size, cb) {
			var data = [],
				lenRow = size[0],
				lenCol = size[1],
				i, j;

			for (i = 0; i < lenRow; i++) {
				data[i] = [];
				for (j = 0; j < lenCol; j++) {
					data[i].push('');
				}
			}

			this.data = data;
			this.initialData = $.extend(true, [], data);
			this._pushUndoStack(this.data);
			this.notifyView();
			cb();
		},

		/**
		 * データからシートを生成
		 *
		 * @method _initSheetWithData
		 * @private
		 * @param {json} data
		 * @param {Function} callback
		 * @example
		   データ形式
		   [
		       ['a', 'b', 'c'],
		       ['d', 'e', 'f'],
		       ['g', 'h', 'i']
		   ]
		 */
		_initSheetWithData: function (data, cb) {
			if (data && data instanceof Array) {
				this.data = data;
				this.initialData = $.extend(true, [], data);
				this._pushUndoStack(this.data);
				this.notifyView();
				cb();
			} else { 
				this.notifyView('データの形式が正しくありません');
			}
		},

		/**
		 * 指定URLからjsonを取得、シート生成
		 *
		 * @method _initSheetWithUrl
		 * @private
		 * @param {String} url
		 * @param {Function} callback
		 */
		_initSheetWithUrl: function (url, cb) {
			var self = this;

			if (url) {
				self.notifyView('URLが指定されていません');
				throw new Error('request url is not provided');
			} else { 
				$.when($.get(url))
					.done(function (data) {
						if (data.items && data.items instanceof Array) {
							self.settings.data = data.items;
							self._initSheetWithData(data.items, cb);
						} else { 
							self.notifyView('取得したデータの形式が正しくありません');
						}
					})
					.fail(function () {
						self.notifyView('データの取得に失敗しました');
					});
			}
		},

		/**
		 * 指定オフセットでデータを更新する
		 *
		 * @method setData
		 * @param {Array} data
		 * @param {Array} offset
		 */
		setData: function (data, offset) {
			var offsetX = 0, offsetY = 0, i, j;
			if (offset) {
				offsetY = parseInt(offset[0], 10);
				offsetX = parseInt(offset[1], 10);
			}

			if (!this.clippedData) {
				for (i = 0, lenRow = data.length; i < lenRow; i++) {
					if (
						typeof this.data[i + offsetY] !== 'undefined' &&
						typeof data[i] !== 'undefined'
					) {
						for (j = 0, lenCol = data[i].length; j < lenCol; j++) {
							if (
								typeof this.data[i + offsetY][j + offsetX] !== 'undefined' &&
								typeof data[i][j] !== 'undefined'
							) {
								this.data[i + offsetY][j + offsetX] = data[i][j];
							}
						}
					}
				}
			} else { 
				for (i = 0, lenRow = data.length; i < lenRow; i++) {
					if (
						typeof this.clippedData[i + offsetY] !== 'undefined' &&
						typeof data[i] !== 'undefined'
					) {
						for (j = 0, lenCol = data[i].length; j < lenCol; j++) {
							if (
								typeof this.clippedData[i + offsetY][j + offsetX] !== 'undefined' &&
								typeof data[i][j] !== 'undefined'
							) {
								this.clippedData[i + offsetY][j + offsetX] = data[i][j];
							}
						}
					}
				}
			}

			this._pushUndoStack(this.data);
			this.notifyView();
		},

		/**
		 * クリップボードをエミュレート
		 *
		 * @method setClippedData
		 * @param {} indexes
		 */
		setClippedData: function (indexes) {
			if (indexes.length) {
				this.adjustVisibleIndexes(indexes);

				var tmpData = $.extend(true, [], this.data),
					i, j, lenRow, lenIds;

				for (i = 0, lenRow = tmpData.length; i < lenRow; i++) {
					for (j = 0, lenIds = this.hiddenIndexes.length; j < lenIds; j++) {
						tmpData[i].splice([this.hiddenIndexes[j]], 1);
					}
				}
				if (tmpData.length != this.data.length || tmpData[0].length != this.data[0].length) {
					this.clippedData = $.extend(true, [], tmpData);
				}
			}

			this._pushUndoStack(this.clippedData);
			this.notifyView();
		},

		/**
		 * @method adjustVisibleIndexes
		 * @param {Array} indexes
		 */
		adjustVisibleIndexes: function (indexes) {
			var i, len, lenCol;
			// 初期化
			if (!this.defaultIndexes) {
				this.defaultIndexes = [];	
				for (i = 0, lenCol = this.data[0].length; i < lenCol; i++) {
					this.defaultIndexes.push(i);
				}
				this.visibleIndexes = $.extend(true, [], this.defaultIndexes);
			}

			// indexesを走査してvisibleIndexesからキー削除
			indexes.reverse();
			for (i = 0, len = indexes.length; i < len; i++) {
				this.visibleIndexes.splice(indexes[i], 1);
			}
			this.hiddenIndexes = _.difference(this.defaultIndexes, this.visibleIndexes);
			this.hiddenIndexes.reverse();
		},

		/**
		 * viewを更新する
		 *
		 * @method notifyView
		 * @param {String} [message] エラーメッセージ
		 */
		notifyView: function (message) {
			if (this.view) {
				if (message) {
					this.view.update(message);
					
				} else { 
					if (!this.clippedData) {
						this.view.update(this.data);
					} else { 
						this.view.update(this.clippedData);
					}
				}
			}
		},

		/**
		 * UndoStackをポップしてviewを更新する
		 *
		 * @method undo
		 */
		undo: function () {
			if (this._popUndoStack()) {
				this.notifyView();
			}
		},

		/**
		 * UndoStackにデータをプッシュする
		 *
		 * @method _pushUndoStack
		 * @private
		 * @param {Array} data
		 */
		_pushUndoStack: function (data) {
			this.undoFlag = false;
			this.undoDataStack.push($.extend(true, [], data));
			if (this.undoDataStack.length > this.settings.maxUndoStack) {
				this.undoDataStack.shift();
			}
		},

		/**
		 * UndoStackからデータをポップする
		 *
		 * @method _popUndoStack
		 * @private
		 * @return {Array} lastData
		 */
		_popUndoStack: function () {
			var lastData = null;
			if (this.undoDataStack.length > 1) {
				lastData = this.undoDataStack.pop();
			} else { 
				lastData = this.undoDataStack[0];
			}
			if (lastData) {
				this.data = $.extend(true, [], lastData);
			}
			if (!this.undoFlag) {
				this.undoFlag = true;
				lastData = this._popUndoStack();
			}
			return lastData;
		},

		/**
		 * シートの2次元配列データを返す
		 *
		 * @method getData
		 * @return {Array} data
		 */
		getData: function () {
			if (!this.clippedData) {
				return $.extend(true, [], this.data);
			} else { 
				return $.extend(true, [], this.clippedData);
			}
		},

		/**
		 * 初期化時のシートの2次元データを返す
		 *
		 * @method getInitialData
		 * @return {Array} data
		 */
		getInitialData: function () {
			return $.extend(true, [], this.initialData);
		}
	};

	return DataModel;
});
