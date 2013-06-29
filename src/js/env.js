/**
 * @module excel
 */
define(function () {

	META_KEY = {
		ENTER     : 13,
		UP        : 38,
		DOWN      : 40,
		LEFT      : 37,
		RIGHT     : 39,
		ESCAPE    : 27,
		SPACEBAR  : 32,
		CTRL      : 17,
		ALT       : 18,
		TAB       : 9,
		SHIFT     : 16,
		COMMAND   : 91,
		BACKSPACE : 8,
		DELETE    : 46
	};
	ALP_KEY = {
		A         : 65,
		C         : 67,
		R         : 82,
		V         : 86,
		X         : 88,
		Z         : 90
	};

	return {
		META_KEY : META_KEY,
		ALP_KEY  : ALP_KEY
	};
});
