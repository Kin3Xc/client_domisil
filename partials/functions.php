<?php 

// para definir moneda colombiana
// function pippin_extra_edd_currencies( $currencies ) {
// 	$currencies['COP'] = __('Peso Colombiano', 'your_domain');
// 	return $currencies;
// }
// add_filter('edd_currencies', 'pippin_extra_edd_currencies');
//hook para agregar campos extras a nuestra categoría

// update_option('image_default_link_type' , 'post');//habilitar laurl de as imagenes para que carguen el post
add_action( 'after_setup_theme', 'default_attachment_display_settings' );
function default_attachment_display_settings() {
    update_option( 'image_default_link_type', 'post' );
}

function custom_excerpt_length($length){
	return 12;
}
add_filter('excerpt_length', 'custom_excerpt_length');