/**
 * @module excel
 */
define(function () {

	/**
	 * @class Util
	 * @static
	 */
	var Util = {

		/**
		 * 与えられた配列の内容が一致するか
		 *
		 * @method checkArrayEquality
		 * @param {Array} a
		 * @param {Array} b
		 * @return {Boolean}
		 */
		checkArrayEquality: function (a, b) {
			var ret = true, i, len;
			for (i = 0, len = a.length; i < len; i++) {
				if (Util.isArray(a[i]) && Util.isArray(b[i])) {
					if (!Util.checkArrayEquality(a[i], b[i])) {
						ret = false;
					}
				} else { 
					if (a[i] !== b[i]) {
						ret = false;
					}
				}
			}
			return ret;
		},

		/**
		 * 配列か判定
		 *
		 * @method isArray
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isArray: function (obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}
	};

	return Util;
});
