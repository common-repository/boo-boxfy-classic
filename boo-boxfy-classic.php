<?php
/*
Plugin Name: boo-boxfy-classic
Plugin URI: http://boo-box.com
Description: Allows you to monetize your content before posting.
Version: 1.0.1
Author: boo-box team
Author URI: http://boo-box.com

	The MIT License

	Copyright (c) 2009 boo-box

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

*/

// lang
load_plugin_textdomain(booboxfy, PLUGINDIR.'/'.dirname(plugin_basename(__FILE__)));

// config/menus/head-script
require_once('boobox_config.php');

// insert <script> on <head>
function booboxfy_head() {
	global $wp_db_version;
	global $wp_version;
	$bb_version = "172-classic";
	$bb_server = get_option('siteurl') . "/wp-content/plugins/boo-boxfy-classic/resources/";
	$js = $bb_server.'boo-boxfy.js?v='.$bb_version;
	$jsConfig = $bb_server.'boo-boxfy-config.js?v='.$bb_version;
	$jsAutoTag = $bb_server.'auto.js?v='.$bb_version;
	$jsModal = $bb_server.'jqModal.js?v='.$bb_version;
	$css = $bb_server.'boo-boxfy.css?v='.$bb_version;
	$cssModal = $bb_server.'jqModal.css?v='.$bb_version;
	$cssautoTag = $bb_server.'autotag.css?v='.$bb_version;
	$cssTagTool = $bb_server.'tool.css?v='.$bb_version;
	
	if (preg_match('/\/post(\-new)?\.php/i' , $_SERVER['REQUEST_URI'])) {
			echo "\n<script type=\"text/javascript\" src=\"" . $js . "&bid=" . get_option('boo_booaffid') . "&lang=" . get_option('boo_booafflang') . "&email=" . get_option('boo_boomail') . "&version=".$wp_version."\" id=\"booboxfy\"></script>";
		echo "\n <!-- boo-boxfy (boo-box) -->";
		echo "\n<script type=\"text/javascript\" src=\"" . $jsModal . "\"></script>";
		echo "\n<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $css . "\" />";
		echo "\n<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $cssModal . "\" />\n";
		echo "\n<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $cssTagTool . "\" />\n";
		echo "\n<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $cssautoTag . "\" />\n";
		$bbOnload = '<script type="text/javascript"> jQuery(document).ready(function(){ 
			bbD.tool.init();});</script>';
		echo $bbOnload;
	} else if (preg_match('/\/(plugins|options\-general)\.php/i' , $_SERVER['REQUEST_URI'])) {
		echo "\n<script type=\"text/javascript\" src=\"" . $jsConfig . "\"></script>";
	}
	
	// para traduzir mensagens do JS
	echo '<script type="text/javascript">
	/* <![CDATA[ */
	booboxfyL10n = {
		tag: "'. 'Escolha tags que serão usadas para buscar produtos na boo-box.'/*__("Choose tags that will be used to search for products in the boo-box.", "booboxfy")*/ .'",
		cont: "'. 'Imagens / YouTube'/*__("Images / YouTube", "booboxfy")*/ .'",
		none: "'. __("There is no content in image or video that you can apply boo-box.", "booboxfy") .'",
		noconfig: "'. __("You need to set up the boo-box before using it.", "booboxfy") .'",
		closewindow: "'. 'Fechar'/*__("Close", "booboxfy")*/ .'",
		applyto: "'. 'Aplicar'/*__("Apply", "booboxfy")*/ .'",
		selectone: "'. __("Select", "booboxfy") .'",
		configbtn: "'. __("Configure", "booboxfy") .'",
		remove: "'. __("remove boo-box", "booboxfy") .'",
		image: "'. __("image", "booboxfy") .'"
	}
	
	$ = jQuery.noConflict();
	
	$(document).ready(function(){
		$("#boo_advanced_button").click(function(){
			$("#boo_advanced_options").show();
			$(this).hide();
		});
	});
	/* ]]> */
	</script>';
}

// insere campos extras de widget na interface
function bb_insert_custom( $id ) {
	global $post;
	// escreve na tela (sim, css aqui no meio é feio ;)
	$out = '<input type="hidden" name="bb-custom-field-verify-key" id="bb-custom-field-verify-key" value="' . wp_create_nonce('bb-custom-field') . '" />';
	$out .= '<div id="bb-custom-editform">';
	$out .= '<span class="bb-custom-tags-holder"><label for="bb-custom-tags">' . 'Tags para o boo-box widget'/*__('Tags to boo-box widget:', 'booboxfy')*/ . '</label> <input type="text" name="bb-custom-tags" id="bb-custom-tags" value="'. get_post_meta($post->ID, 'bb-custom-tags', true) .'" /></span>';
	$out .= '</div>';
	echo $out;
}

// manipula os campos extras
function edit_meta_value( $id ) {
	global $wpdb;
	
	// caso não tenha id, tenta pegar da edição
	if( !isset( $id ) ) {
		$id = $_REQUEST[ 'post_ID' ];
	}
	
	// caso o usuário não poder fuçar, trava ele
	if( !current_user_can('edit_post', $id) ) {
		return $id;
	}
	
	// caso a primeira função (a que inclui os campos) não ter funcionado, trava
	if( !wp_verify_nonce($_REQUEST['bb-custom-field-verify-key'], 'bb-custom-field') ){
		return $id;
	}
	
	// passa pelos dois campos
	$fields = array('bb-custom-tags');
	
	foreach( $fields as $title ) {
		$title = $wpdb->escape(stripslashes(trim($title)));
		
		$meta_value = stripslashes(trim($_REQUEST[ "$title" ]));
		
		// sempre deleta
		delete_post_meta( $id, $title );
		
		// e escreve somente se tiver valor
		if( isset( $meta_value ) && !empty( $meta_value ) ) {
			add_post_meta( $id, $title, $meta_value );
		}
	}
}

function show_widget($content) {
	global $post;
	if ((is_front_page() || is_paged()) && get_option('boo_nohome')) {
		return $content;
		exit;
	}
	$keywords = get_post_meta($post->ID, 'bb-custom-tags', true);
	$widget_keyword = '';
	
	// se tiver keyword definida
	if ( isset( $keywords ) && !empty( $keywords ) ) {
		$widget_keyword = $keywords;
	} else if (get_option('boo_gettag')) {
		// pega a última tag cadastrada para esse post
		$tags = wp_get_post_tags( $post->ID, array('orderby' => 'term_id') );
		$widget_keyword = $tags[count($tags)-1]->name;
	}
	
	if ($widget_keyword != '') {

		$widget_options = "";
		if (!get_option('boo_formats') || get_option('boo_formats') == '') {
			$widget_options .=  'bb_width = "' . get_option('boo_width') . '";'
								.'bb_limit = "' . get_option('boo_limit') . '";';
		} else {
			$widget_options .= 'bb_limit = "' . get_option('boo_limit') . '";'
								.'bb_format = "' . get_option('boo_formats') . '";';
		}
		
		$widget = '<!-- boo-widget start -->
					<script type="text/javascript">
					bb_keywords = "'.$widget_keyword.'";
					bb_bid  = "'. get_option('boo_booaffid') .'";
					bb_lang  = "'. get_option('boo_booafflang') .'";
					bb_name = "custom";'
					. $widget_options .
					'</script>
					<script type="text/javascript" src="http://widgets.boo-box.com/javascripts/embed.js"></script>
					<!-- boo-widget end -->';
		return $content . $widget;
	} else {
		return $content;
	}
}

function mce3_booboxfy($arr) {
	$path = get_option('siteurl') . '/wp-content/plugins/boo-boxfy-classic/resources/mce3_booboxfy.js';
	$arr['booboxfymce'] = $path;
	return $arr;
}

function mce3_booboxfy_button($arr) {
	$arr[] = 'booboxfymce';
	return $arr;
}

// hooks
// start atomic bomb with the insert on head of pages
if ( !function_exists('boo_head_script') ) {
	// insert <script> on <head>
	function boo_head_script() {
		global $boobox_head_added;

		if (!$boobox_head_added) {
			echo "\n <!-- boo-box for WordPress -->";
			echo "\n<script type=\"text/javascript\" src=\"http://stable.boo-box.com/\"></script>\n";
			$boobox_head_added = true;
		}
	}
	add_action('wp_head', 'boo_head_script');
}

add_action( 'simple_edit_form', 'bb_insert_custom' );
add_action( 'edit_form_advanced', 'bb_insert_custom' );
add_action( 'edit_post', 'edit_meta_value' );
add_action( 'save_post', 'edit_meta_value' );
add_action( 'publish_post', 'edit_meta_value' );
add_action( 'the_content', 'show_widget' );
add_action( 'admin_head', 'booboxfy_head' );
// Tagging Tool
add_filter('mce_external_plugins', 'mce3_booboxfy');
add_filter('mce_buttons', 'mce3_booboxfy_button');

// all we need is jquery

// thx to graveheart for bootube - http://www.guravehaato.info/blog/novo-plugin-para-wordpress-bootube/
// (não é mais usado, mas mantem backward)
require_once('resources/booboxfytube.php');

?>
