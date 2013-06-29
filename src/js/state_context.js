/**
 * @module excel
 */
define([
	'state/edit_state',
	'state/normal_meta_state',
	'state/normal_mousedown_state',
	'state/normal_shift_meta_state',
	'state/normal_shift_state',
	'state/normal_state'
], function (
	EditState,
	NormalMetaState,
	NormalMousedownState,
	NormalShiftMetaState,
	NormalShiftState,
	NormalState
) {
	
	/**
	 * 状態管理クラス
	 *
	 * @class StateContext
	 * @static
	 */
	var StateContext = {
		state: null,
		states: {
			edit_state              : EditState,
			normal_meta_state       : NormalMetaState,
			normal_mousedown_state  : NormalMousedownState,
			normal_shift_meta_state : NormalShiftMetaState,
			normal_shift_state      : NormalShiftState,
			normal_state            : NormalState
		},

		/**
		 * @method transState
		 * @param {String} type
		 * @param {Object} context
		 */
		transState: function (type, context) {
			if (this.states[type]) {
				this.state = new this.states[type](this, context);
				if (window.console && window.console.log) {
					console.log(this.state.toString());
				}
			}
		}
	};

	return StateContext;
});
