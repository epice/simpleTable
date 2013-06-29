/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 編集中 ステートクラス
	 *
	 * @class EditState
	 * @constructor
	 * @extends AbstractState
	 */
	var EditState = function (stateCtx, view) {
		this.name = 'EditState';
		this.stateCtx = stateCtx;
		this.view = view;
		this.view.startEditing(this.view);
	};

	$.extend(EditState.prototype, AbstractState.prototype, {
		
		/**
		 * @method keydown
		 * @param {EventObject} e
		 */
		keydown: function (e) {
			var view = this.view;

			if (e.keyCode == this.META_KEY.ENTER) {
				if (!e.altKey) {
					view.$textarea.trigger('hide' + config.event.NAMESPACE);
					this.stateCtx.transState('normal_state', view);
					return;
				}
			}
		},
		
		/**
		 * @method click
		 * @param {EventObject} e
		 * @param {jQueryObject} $el
		 */
		click: function (e, $el) {
			var view = this.view;

			if (e.target.nodeName.toLowerCase() != 'textarea') {
				view.$textarea.trigger('hide' + config.event.NAMESPACE);
				this.stateCtx.transState('normal_state', view);
			}
		}
	});

	return EditState;
});
