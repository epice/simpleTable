/**
 * @module excel
 */
define(function () {

	var viewConf = {
		cellTypeDefinition : {
			medium   : ['商品名', 'サイズ\(cm\)', 'サイズ', '仕様', '素材', 'セット内容'],
			wide     : ['フリーテキスト', '商品情報','成分'],
			disabled : ['発注ID', '色ID', 'サイズID']
		},
		CANVAS_ID    : 'excel_canvas',
		CONTAINER_ID : 'excel_canvas_container'
	};
	var modelConf = {
	
	};
	var classConf = {
		DISABLED         : 'disabled',
		SELECTED         : 'selected',
		EDITING          : 'editing',
		HIDDEN           : 'hidden',
		SELECTION_AREA   : 'selection_area',
		SELECTION_BORDER : 'selection_border',
		SELECTION_HANDLE : 'selection_handle'
	};
	var attrConf = {
		CELL_ID : 'data-cell-id'
	};
	var eventConf = {
		NAMESPACE : '.excel_evt'
	};

	return {
		view  : viewConf,
		model : modelConf,
		event : eventConf,
		cls   : classConf,
		attr  : attrConf
	};
});
