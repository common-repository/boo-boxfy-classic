/**
 * $Id: mce3_editor_plugin.js 201 2008-02-12 15:56:56Z $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('booboxfymce');

	tinymce.create('tinymce.plugins.BooBoxFy', {
		init : function(ed, url) {
			
			cls = 'mceBootag';

			// Register commands
			ed.addCommand('mceBootag', function() {
				self.set_html = function (html) {
					ed.selection.setContent(html);
				}
				$('#bboxxy_dialog').jqmShow();
				var html = self.temp_html;
				
				(html.match(/\<img/gi) || html.match(/\<object/gi)) ? bbD.tool.bbmedia() : bbD.tool.bbtext();	
			});


			// Register buttons
			ed.addButton('booboxfymce', {title : 'monetize!', image : '../wp-content/plugins/boo-boxfy-classic/resources/booboxtag.png', cmd : cls});
			
			ed.onNodeChange.add(function(ed, cm, n) {
				cm.get( 'booboxfymce' ).setDisabled(ed.selection.isCollapsed());
				self.temp_html = ed.selection.getContent();
			});
		},
		getInfo : function() {
			return {
				longname : "boo-box Tagging Tool for boo-boxfy",
				author : 'boo-box team',
				authorurl : 'http://boo-box.com',
				infourl : 'http://boo-box.com',
				version : '0.1'
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('booboxfymce', tinymce.plugins.BooBoxFy);
	var self = tinymce.plugins.BooBoxFy;
})();
