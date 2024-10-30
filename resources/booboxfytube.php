<?php
// thx to graveheart
// http://www.guravehaato.info/blog/novo-plugin-para-wordpress-bootube/

// função que faz a magica acontecer.
function bootube_post($the_content) {
	$matches = array();
	if (preg_match_all('/\[bootube:([^=]*)=([^\]]*)\]+/i', $the_content, $matches, PREG_SET_ORDER)) {
		foreach ($matches as $match) {
			$the_content = str_replace($match[0], give_code($match[1], $match[2]), $the_content);
		}
	}
	return $the_content;
}

// pega as saídas da função anterior e as insere no código boo-box
function give_code($file, $boo_tags) {
	
    $afiliado = get_option('boo_shopid');
    $id = get_option('boo_affid');
	
	$width = 425;
	$height = 350;
	
	$tag_line = "<object type=\"application/x-shockwave-flash\" data=\"http://stable.boo-box.com/static/flash/boo-player.swf\" width=";
	$tag_line .= $width;
	$tag_line .= "\" height=\"";
	$tag_line .= $height;
	$tag_line .= "\"><param name=\"movie\" value=\"http://stable.boo-box.com/static/flash/boo-player.swf\" /><param name=\"wmode\" value=\"transparent\" /><param name=\"AllowScriptAccess\" value=\"all\" /><param name=\"allowFullScreen\" value=\"true\" />";
	$tag_line .= "<param name=\"flashvars\" value=\"id=$id&shop=$afiliado&video=http://www.youtube.com/watch?v=";
	$tag_line .= $file;
	$tag_line .= "&tags=$boo_tags\" /><a href=\"http://boo-box.com/video/youtubeid:";
	$tag_line .= $file;
	$tag_line .= "/aff:";
	$tag_line .= "$afiliado";
	$tag_line .= "/uid:";
	$tag_line .= "$id";
	$tag_line .= "/tags:";
	$tag_line .= "$boo_tags\" class=\"bbli\">";
	$tag_line .= "view video<img src=\"http://www.boo-box.com/bbli\" alt=\"[bb]\" class=\"bbic\" /></a></object>";
        
    return $tag_line;
}

add_filter( 'the_content', 'bootube_post' );
add_filter( 'the_excerpt','bootube_post' );

?>