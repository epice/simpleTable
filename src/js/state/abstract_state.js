/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['env'], function (env) {

	/**
	 * ステートパターン抽象クラス
	 *
	 * @class AbstractState
	 * @constructor
	 * @param {Object} stateCtx
	 * @param {Object} view
	 */
	var AbstractState = function (stateCtx, view) {
		
		/**
		 * toStringで返すクラス名
		 *
		 * @property name;
		 * @type String
		 */
		this.name = 'AbstractState';
		
		/**
		 * ステート管理オブジェクト
		 *
		 * @property stateCtx;
		 * @type Object
		 */
		this.stateCtx = stateCtx;
		
		/**
		 * 再描画を通知するview
		 *
		 * @property view;
		 * @type Object
		 */
		this.view = view;
	};

	AbstractState.prototype = {
		
		META_KEY  : env.META_KEY,
		ALP_KEY   : env.ALP_KEY,

		/**
		 * キーアップ
		 *
		 * @method keyup
		 * @param {EventObject} e
		 */
		keyup     : function (e) {},
		
		/**
		 * キーダウン
		 *
		 * @method keydown
		 * @param {EventObject} e
		 */
		keydown   : function (e) {},
		
		/**
		 * クリック
		 *
		 * @method click
		 * @param {EventObject} e
		 */
		click     : function (e) {},
		
		/**
		 * マウスダウン
		 *
		 * @method mousedown
		 * @param {EventObject} e
		 */
		mousedown : function (e) {},
		
		/**
		 * マウスムーブ
		 *
		 * @method mousemove
		 * @param {EventObject} e
		 */
		mousemove : function (e) {},
		
		/**
		 * マウスアップ
		 *
		 * @method mouseup
		 * @param {EventObject} e
		 */
		mouseup   : function (e) {},

		/**
		 * クラス名を返す
		 *
		 * @method toString
		 * @return {String} name 
		 */
		toString: function () { return this.name; },

		/**
		 * 単一セルを再描画
		 *
		 * @method _updateActiveUniqCell
		 * @private
		 * @param {Array} pos
		 * @param {Boolean} scrollTo
		 */
		_updateActiveUniqCell: function (pos, scrollTo) {
			var view = this.view;
			view.renderActiveUniqCell(pos, scrollTo);
		},

		/**
		 * 選択範囲を再描画
		 *
		 * @method _updateActiveRange
		 * @private
		 * @param {Array} startPos
		 * @param {Array} endPos
		 */
		_updateActiveRange: function (startPos, endPos) {
			var view = this.view;
			view.renderSelectionArea(startPos, endPos);
		}
	};

	return AbstractState;
});
