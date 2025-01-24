odoo.define('website_product_configurator_ept.product_config', function (require) {
'use strict';

    var sAnimations = require('website.content.snippets.animation');
    var ajax = require('web.ajax');
    var Dialog = require('web.Dialog');
    var core = require('web.core');
    var _t = core._t;
    var url= window.location.pathname
	if(url.includes('/my/product-configurator')){
        var searchParams = new URLSearchParams(window.location.search)
		if(window.location.search.length > 0 && searchParams.get('print'))
		{
		    setTimeout(function(){ $('.js-print-btn').click() }, 1000);
		}
	}

    sAnimations.registry.ProductConfig = sAnimations.Class.extend({
        selector: '#wrapwrap',
        read_events: {
            'click .attribute_select' : '_onAttributeChange', //left penal attribute change to load the form option form
            'click .btn-form-submit' : '_onClickButton', // Save the form data on next previous button
            'click #multinode-options .node': '_onnodeChange', // Change the node based on it set or create session
            'click #submit-name,.js_change_name': '_changeSessionName', // change Session name
            'click .next-node': '_onnextnodeClick', // for next node create or set session and load form for that session
            'click .perv-node': '_onpervnodeClick', // for pervious node create or set session and load form for that session
            'click .js_reset_node' : '_onClickReset', // Reset the current node
            'click .js-save-configure' : '_onClickSaveConfigure', // Open popup for save current session
            'click .js-load-configure' : '_onClickLoadConfigure', // Open popup for load current session
            'click .js-request-quote, .js-ask-question' : '_onClickRequestQuote', // Open popup for request a quote / ask a question
            'click .js-email-configure' : '_onClickEmailConfigure', // Open popup for email
            'click .js_reset_attribute' : '_onClickResetAttribute', // Reset the current attribute
            'click .js-send-email': '_sendEmail', // Send email
            'click .accordion-session .card-header[data-toggle="collapse"]' : '_onClickCollapse', // accordion at least one open
            'click .js_edit': '_onnjseditClick',
            'click .js_validate_configuration' : '_onClickValidateConfig',// Validate the session
            'click #js_config_add_to_cart' : '_onClickConfigAddCart', // Add the product into the session
            'click .update_cart_btn' : '_onClickConfigUpdateCart',
            'click .js-extra-button-toggle': '_onClickExtraButton', // Toggle div for extra button for a responsive view
            'click .node_configure': '_onClickConfigureNode', //
            'click .js_config': '_onClickJsConfig', //
            'click .js-print-btn' : '_onClickPrint',//Print the page of current session information
            'click .js-print-config' : '_onClickPrintConfig', // Redirect to portal page and print the session page of current session information
            'click .js_config_form_submit' : '_onClickConfigForm',//shop to configuration page redirection click on configuration
            'change input[type="radio"].config_attr_value': '_onClickConfigAttrRadioValue',
            'change input[type="checkbox"].config_attr_value': '_onClickConfigAttrCheckboxValue',
            'change .line_qty_box': '_onClickLineQtyBox',
            'keyup .cfg_step_header input[name="search"]' : '_onKeyupSearch', // Search for the attribute Value from current node
            'click .js_view_detail' : '_onClickViewDetail', // View the configurator details from cart page
            'click .js_hide_detail' : '_onClickHideDetail', // Hide the configurator details from cart page
            'click .send-request': '_onClickRequestSend',
            'change .js_accessories_input': 'addAccessoryProducts',
            'change input.config_attr_value': '_changeSelectionQty',
            'click .preconfig_button': '_onClickPreconfigButton',
//            'change select#step_controllers': '_changeStepControllers',
            'change select.controller_raid_selection': '_changeControllerRaidSelection',
            'change select.drive_types': '_changeSelectDriveTypes',
            'click #add_storage_controllers': '_onClickAddStorageContoller',
            'click .remove_storage_controllers': '_onClickRemoveStorageContoller',
            'click #add_on_pop_up_add': '_onClickAddContollerPopUp',
            'click .add_value_to_session': '_onClickAddValueInSession',
            'click span.controller-close-btn': '_onClickControllerClose',
            'click span.add_extra_raid_line': '_onAddExtraRaidLine',
            'click span.remove_extra_raid_line': '_onRemoveExtraRaidLine',
            'click input.is_supercap': '_onClickSupercapBox',
            'change select[name="total_comp_qty"]': '_onChangeRaidTotalQty',
            'change select[name="controller_supercap_acc"]': '_onChangeControllerSupercapAcc',
            'keyup .search_component' : '_onKeyupComponentSearch'
        },

        // Show the form on page loading for first element
        start: function() {
//            if(window.location.pathname.startsWith('/product-configure')){
//                var isNegative = $('div.you_save_block .oe_currency_value').text().includes('-')
//                if(parseFloat($('div.you_save_block .oe_currency_value').text()) <= 0 || isNegative){
//                    $(".you_save_block").addClass("d-none");
//                }
//            }
            if(window.location.pathname.startsWith('/product-configure')){
                var session = $('.node .active-node').attr('data-session-id')
                 session && ajax.jsonRpc('/product-configure/get_configurator_price','call', {'session': session}).then(function(data) {
                    if(data){
                        var price = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(data.price);
                        var youSavePrice = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(data.you_save);
                        $('h3.session_price span.oe_currency_value').text(price)
                        $('h3.session_saved_price span.oe_currency_value').text(youSavePrice)
                        var isNegative = youSavePrice.includes('-')
                        if(parseFloat($('div.you_save_block .oe_currency_value').text()) <= 0 || isNegative){
                            $(".you_save_block").addClass("d-none");
                        }
                    }
                });
            }
            $(".attribute_select").first().trigger('click')
            this._showMoreLess();
        },

        // View the session details from  cart page
        _onClickHideDetail : function(ev) {
          $(ev.currentTarget).parent().parent().find(".session_details").toggle( "slow" );
          $(ev.currentTarget).parent().find(".js_view_detail").removeClass('d-none')
          $(ev.currentTarget).addClass('d-none')
        },

        // View the session details from  cart page
        _onClickViewDetail : function(ev) {
          $(ev.currentTarget).parent().find(".js_hide_detail").removeClass('d-none')
          $(ev.currentTarget).addClass('d-none')
          $(ev.currentTarget).parent().parent().find(".session_details").toggle( "slow" );
        },

	    // Search The attribute Product
      _onKeyupSearch : function(ev) {
			var key = $(ev.currentTarget).val().toUpperCase()
			$('.attrib_label').each(function(){
            if ($(this).text().toUpperCase().indexOf(key) > -1) {
					  $(this).parent().removeClass('d-none');
				 } else {
					  $(this).parent().addClass('d-none');
				 }
        	});
        	$('.div_category').each(function(){
				if($(this).find('.attrib_label').parent().not('.d-none').length  == 0)
					{
						$(this).addClass('d-none');
					}
				else{
						$(this).removeClass('d-none')
					}
        	})
			if($('.attrib_label').parent().not('.d-none').length == 0 ){
				$('.cfg_step_attribute_tabs').find('.no_found_msg').remove()
				$('.div_main_form').before('<div class="no_found_msg m-3 alert alert-danger"><b>No results found.</b></div>')
			}
			else{
				$('.cfg_step_attribute_tabs').find('.no_found_msg').length > 0 ? $('.cfg_step_attribute_tabs').find('.no_found_msg').remove() : false
			}

        },

        addAccessoryProducts: function(ev){
            var radio = $(ev.currentTarget).parents('.info_config_attr_value_radio').find('.config_attr_value')
            var accessory_products = $('.div_main_form').find("input[name='accessory_products']").val() || 0;
            var temp_attr = accessory_products ? accessory_products.split(',') : 0;
            var temp_arr_att = [];
            if(temp_attr.length > 0){
                for(var i=0;i<temp_attr.length;i++){
                    temp_arr_att.push(parseInt(temp_attr[i]));
                }
            }
            if($(ev.currentTarget).is(":checked")) {
                var accessory_id = parseInt($(ev.currentTarget).val())
                temp_arr_att.push(accessory_id);
            } else {
                for(var i=0;i<temp_attr.length;i++){
                    if(parseInt(temp_attr[i]) == parseInt($(ev.currentTarget).val())){
                        temp_arr_att.splice(i,1);break;
                    }
                }
            }
            temp_arr_att = jQuery.grep(temp_arr_att, function(value) {
              return value != 0;
            });
            $(radio).change();
            $('.div_main_form').find("input[name=accessory_products]").val(temp_arr_att);
        },

		// calc accessories price product price based on accessories qty
        _calc_accessories_price :function(elem,node,dataqty) {
            var aprice = 0.0;
            $('.component_accessories:not(".d-none") .js_accessories_items [data-attrb_id='+elem.val()+']:checked').each(function(){
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length && elem.parents('div.info_config_attr_value_radio').is($(this).parents('div.info_config_attr_value_radio'))){
                if(elem.parents('div.info_config_attr_value_radio').is($(this).parents('div.info_config_attr_value_radio'))){
                    var aqty = $(this).attr('data-qty');
                    var fix_qty= $(this).attr('data-fix-qty');
                    if(fix_qty == 'False') {
                        aqty = aqty*dataqty
                        aqty && $(this).siblings('label').find('.accessories_qty').html(parseInt(aqty))
                    }
                    if( $(this).attr('data-price') > 0) {
                        aprice = aprice + $(this).attr('data-price') * node * aqty
                    }
                }
            })
            return aprice;
        },

        _calc_accessories_total_price :function(elem,node,dataqty) {
            var aprice_total = 0.0;
            $('.component_accessories:not(".d-none") .js_accessories_items [data-attrb_id='+elem.val()+']:checked').each(function(){
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length && elem.parents('div.info_config_attr_value_radio').is($(this).parents('div.info_config_attr_value_radio'))){
                if(elem.parents('div.info_config_attr_value_radio').is($(this).parents('div.info_config_attr_value_radio'))){
                    var aqty = $(this).attr('data-qty');
                    var fix_qty= $(this).attr('data-fix-qty');
                    if(fix_qty == 'False') {
                        aqty = aqty*dataqty
                        aqty && $(this).find('.accessories_qty').html(parseInt(aqty))
                    }
                    if( $(this).attr('data-total-price') > 0) {
                        aprice_total = aprice_total + $(this).attr('data-total-price') * node * aqty
                    }
                }
            })
            return aprice_total;
        },
        _calc_accessories_node_qty: function(elem,node,dataqty) {
            // node qty calculation for current step
            var global_qty = parseInt($('input#global_qty').val());
            var selected_attribute_qty = 0;
            $('.config_attr_value[data-check-global_qty]').each(function(){
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length && $(this)[0].checked && parseInt($(this)[0].value) != parseInt(elem[0].value)){
                if($(this)[0].checked && parseInt($(this)[0].value) != parseInt(elem[0].value)){
                    selected_attribute_qty = selected_attribute_qty + parseInt($(this).attr('data-qty'));
                }
            });
            if (elem.attr('data-check-global_qty')) {
//                if(!elem.parents('.info_config_attr_value_radio.d-none').length && elem[0].checked){
                if(elem[0].checked){
                    selected_attribute_qty = selected_attribute_qty + parseInt(dataqty)
                }
            }
            var current_attribute_qty = 0;
            var selected_accessories_qty = 0;
            if (elem.attr('data-check-global_qty')) {
                $('.component_accessories:not(".d-none") .js_accessories_items [data-global-check][data-attrb_id]:checked').each(function(){
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        var aqty = parseInt($(this).siblings().find('.accessories_qty').html());
                        selected_accessories_qty = selected_accessories_qty + parseInt(aqty)
//                    }
                });
            }
            $('input#selected_attribute_qty').val(selected_attribute_qty);
            $('input#selected_accessories_qty').val(selected_accessories_qty);
        },

        // Change the price while changing the attribute value radio type
        _onClickConfigAttrRadioValue : function(ev) {
           var radio = $(ev.currentTarget)
           $(".cus_theme_loader_layout_config").removeClass("d-none");
           $(".attribute_select").addClass("loader");
           var is_same = $('.node_configure').attr('same_configure_node')
           var node = 1;
            if(is_same=="1") {
                node = parseInt($('.node_configure').attr('total-node-count'))
            }
            if(radio.is(':checked')) {
                // Display You Save
                $('.you_save_block').removeClass('d-none');
               // Hide and Show the Accessories Products
               if(parseInt(radio.attr('data-threshold-qty') || 0) <= (parseInt($("select[name='line_qty_"+radio.val()+"']").val()) || 1)){
                  $(ev.currentTarget).parents('.js_attrib_val').find('.component_accessories').removeClass('d-none')
               }
//               if ((parseInt($('.div_main_form').find("input[type='radio']").attr('data-threshold-qty')) || 0) <= $("select[name='line_qty_"+radio.val()+"']").val()) {
//                    $(ev.currentTarget).parents('.js_attrib_val').find('.component_accessories').removeClass('d-none')
//               }
                // $(ev.currentTarget).parents('.js_attrib_val').find('.component_accessories').removeClass('d-none')
               var currentsetprice = parseFloat($('.div_main_form').find("input[type='radio']").attr('data-price'))
               var currentSetTotalPrice = parseFloat($('.div_main_form').find("input[type='radio']").attr('data-total-price'))
               var currentsetqty = parseFloat($('.div_main_form').find("input[type='radio']").attr('data-qty'))
               var currentprice = parseFloat($('.session_price').find('.oe_currency_value').html().replace(/,/g, ''))
               var currentTotalPrice = parseFloat($('.session_total_price').html().replace(/,/g, ''))

//               var selectedConfigPrice = parseFloat(radio.parent().find('.oe_currency_value').html().replace(/,/g, ''))
               var selectedprice = parseFloat(radio.parent().find('.oe_currency_value').html().replace(/,/g, ''))    // isale
               var selectedTotalPrice = parseFloat(radio.parent().find('.prod_sale_price').html().replace(/,/g, ''))  // sale
//               if(!selectedprice || !selectedTotalPrice){
//                    selectedprice = 0
//                    selectedTotalPrice = 0
//               }
               if(!selectedprice && selectedTotalPrice){
                    selectedprice = selectedTotalPrice
               } else if(!selectedTotalPrice && selectedprice) {
                    selectedTotalPrice = selectedprice
               }
               //
               var selectedqty= $(ev.currentTarget).parent().find("select[name='line_qty_"+radio.val()+"']").val() == '0' ? $(radio.parents('.attrib_label').find('.line_qty_box option')[1]).val() : $(ev.currentTarget).parent().find("select[name='line_qty_"+radio.val()+"']").val()
               var currentNodeQty = parseFloat($('.div_main_form').find("input[type='radio']").attr('attrb_qty'))
               var current_aprice = parseFloat($('.div_main_form').find("input[type='radio']").attr('data-aprice'))
               var current_aprice_total = parseFloat($('.div_main_form').find("input[type='radio']").attr('data-aprice-total'))
               //
//               var set_aprice = radio.attr('is-config-item-only') ? 0 : this._calc_accessories_price(radio,node,selectedqty)
               var set_aprice_total = this._calc_accessories_total_price(radio,node,selectedqty)
               var set_aprice = this._calc_accessories_price(radio,node,selectedqty)
               if(!set_aprice_total && set_aprice){
                    set_aprice_total = set_aprice
               } else if(!set_aprice && set_aprice_total) {
                    set_aprice = set_aprice_total
               }
//               var set_aprice_total = radio.attr('is-config-item-only') ? 0 : this._calc_accessories_total_price(radio,node,selectedqty)
               //  var set_aprice = this._calc_accessories_price(radio,node,selectedqty)
               //  var set_aprice_total = this._calc_accessories_total_price(radio,node,selectedqty)
               //
               var set_node_qty = this._calc_accessories_node_qty(radio,node,selectedqty)
//               var configPrice = currentprice - ((currentsetprice)*node*currentsetqty) - current_aprice + (parseFloat(selectedConfigPrice)*node*selectedqty) + set_aprice
               var price = currentprice - ((currentsetprice)*node*currentsetqty) - current_aprice + (parseFloat(selectedprice)*node*selectedqty) + set_aprice
               var total_price = currentTotalPrice - ((currentSetTotalPrice)*node*currentsetqty) - current_aprice_total + (parseFloat(selectedTotalPrice)*node*selectedqty) + set_aprice_total
               $('.session_price').find('.oe_currency_value').html((price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               $('.session_total_price').html((total_price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               $('.session_saved_price').find('.oe_currency_value').html(((total_price - price).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               if(total_price - price <= 0){
                    $('.you_save_block').addClass('d-none');
               }
//               else {
//                    $('.you_save_block').removeClass('d-none');
//               }
               $('.div_main_form').find("input[type='radio']").attr('data-price',selectedprice)
//               $('.div_main_form').find("input[type='radio']").attr('data-price',selectedConfigPrice)
               $('.div_main_form').find("input[type='radio']").attr('data-total-price', selectedTotalPrice)
               $('.div_main_form').find("input[type='radio']").attr('data-qty',selectedqty)
               $('.div_main_form').find("input[type='radio']").attr('data-aprice',set_aprice)
               $('.div_main_form').find("input[type='radio']").attr('data-aprice-total', set_aprice_total)
                if ($('.div_main_form').find("input.config_attr_value[type='radio'],input.config_attr_value[type='checkbox']").attr('data-disable-step')) {
                    $('li.attribute_container.attribute_select').each(function(){
                        if($(this).attr('data-disable-step') == $('.div_main_form').find("input.config_attr_value[type='radio'],input.config_attr_value[type='checkbox']").attr('data-disable-step')){
                            $(this).addClass('restricted')
                            $(this).find('.mark-done').removeClass('d-none');
                        }
                    });
                }
                // add validation for required step
                if ($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-required-step')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-required-step'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && !$(this).find('.lead').length) {
                            $(this).find('.attr-name').append('<span class="lead lead-required-step">*</span>');
                        }
                    });
                }
                // add validation for dynamic required step group
//                if ($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes')) {
//                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes'))
//                    $('li.attribute_container.attribute_select').each(function(){
//                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
//                            $(this).find('.lead').addClass('d-none');
//                        }
//                    });
//                }
                if ($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
                            $(this).find('.lead').addClass('d-none');
                        }
                    });
                }
                if($('input[name="is_sub_steps"]').length){
                    this._manageSelControllerVisibility()
//                    var controllerName = radio.attr('controller-name') || ''
//                    var controllerDiv = $('div#sel_controller_tabs')
//                    var allSelControllers = []
//                    $(controllerDiv.find('span')).each(function(){
//                        allSelControllers.push($(this).html());
//                    });
//                    if(!allSelControllers.includes(controllerName)){
//                        controllerDiv.append('<span>' + controllerName + '</span>')
//                        console.log('add')
//                    }
//                    console.log('yes')
                }
            } else {
                // add validation for dynamic required step group
//                if ($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes')) {
//                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='radio']").attr('data-dynamic-required-attributes'))
//                    $('li.attribute_container.attribute_select').each(function(){
//                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
//                            $(this).find('.lead').removeClass('d-none');
//                        }
//                    });
//                }
            }
            $('.line_qty_box').each(function() {
                var currRadio = $(this).parents('.info_config_attr_value_radio').find('.config_attr_value')
                if(radio.is(currRadio)){
                    if(!parseInt($(this).val())){
                        $(this).val($(this).find('option:eq(1)').val());
                     }
                } else {
                    $(this).val("0");
                }
            });
            if($('input[name="is_sub_steps"]').length){
                this._manageSelControllerVisibility();
            }
            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
        },

         // Change the price while changing the attribute value checkbox type
        _onClickConfigAttrCheckboxValue : function(ev) {
           $(".cus_theme_loader_layout_config").removeClass("d-none");
           $(".attribute_select").addClass("loader");
           var checkbox = $(ev.currentTarget)
           var is_same = $('.node_configure').attr('same_configure_node')
           var node = 1;
           $('input[type="checkbox"].config_attr_value:not(:checked)').parents('.js_attrib_val').find('.component_accessories').addClass('d-none')
           if(is_same=="1")
           {
                node = parseInt($('.node_configure').attr('total-node-count'))
           }
           var selQtyBox = checkbox.parents('.info_config_attr_value_radio').find('.line_qty_box')
           if(checkbox.is(':checked'))
           {
                 if(!parseInt(selQtyBox.val())){
                    selQtyBox.val(selQtyBox.find('option:eq(1)').val());
                 }
           		 // Hide and Show the Accessories Products
           		 if(parseInt(checkbox.attr('data-threshold-qty') || 0) <= (parseInt($("select[name='line_qty_"+checkbox.val()+"']").val()) || 1)){
           		    $(ev.currentTarget).parents('.js_attrib_val').find('.component_accessories').removeClass('d-none')
           		 }
//                 if (parseInt($('.div_main_form').find("input[type='checkbox']").attr('data-threshold-qty') || 0) <= $("select[name='line_qty_"+checkbox.val()+"']").val()) {
//    			   	 $(ev.currentTarget).parents('.js_attrib_val').find('.component_accessories').removeClass('d-none')
//                 }
                 var currentprice = $('.session_price').find('.oe_currency_value').html().replace(/,/g, '')
                 // Total isale price before check process
                 var currentTotalPrice = $('.subtotal_price').find('.session_total_price').html().replace(/,/g, '')
                 var currentsetprice = checkbox.attr('data-price')
                 // Sale price of component
                 var currentSetTotalPrice = checkbox.attr('data-total-price')
                 var currentsetqty =  checkbox.attr('data-qty')
//                 var selectedConfigPrice = parseFloat(checkbox.parent().find('.oe_currency_value').html().replace(/,/g, '')) || parseFloat(checkbox.parent().find('.prod_sale_price').html().replace(/,/g, ''))
                 var selectedprice= parseFloat(checkbox.parent().find('.oe_currency_value').html().replace(/,/g, ''))
                 // Sale price of component
                 var selectedTotalPrice= parseFloat(checkbox.parent().find('.prod_sale_price').html().replace(/,/g, ''))
                 if(!selectedprice && selectedTotalPrice){
                    selectedprice = selectedTotalPrice
                 } else if(!selectedTotalPrice && selectedprice) {
                    selectedTotalPrice = selectedprice
                 }
//                 if(!selectedprice || !selectedTotalPrice){
//                    selectedprice = 0;
//                    selectedTotalPrice = 0;
//                 }
//                 var selectedqty= $("select[name='line_qty_"+checkbox.val()+"']").val() == '0' ? $(checkbox.parents('.attrib_label').find('.line_qty_box option')[1]).val() : $("select[name='line_qty_"+checkbox.val()+"']").val()
                 var selectedqty= $(ev.currentTarget).parent().find("select[name='line_qty_"+checkbox.val()+"']").val() == '0' ? $(checkbox.parents('.attrib_label').find('.line_qty_box option')[1]).val() : $(ev.currentTarget).parent().find("select[name='line_qty_"+checkbox.val()+"']").val()
               var current_aprice = 0.0
               var current_aprice_total = 0.0
			   if(parseFloat(currentsetprice) != 0.0 || parseFloat(currentSetTotalPrice) != 0.0)
			   {
			   		current_aprice = this._calc_accessories_price(checkbox,node,currentsetqty)
			   		current_aprice_total = this._calc_accessories_total_price(checkbox,node,currentsetqty)
			   }
			   var set_aprice = this._calc_accessories_price(checkbox,node,selectedqty)
			   var set_aprice_total = this._calc_accessories_total_price(checkbox,node, selectedqty)
			   if(!set_aprice_total && set_aprice){
                    set_aprice_total = set_aprice
               } else if(!set_aprice && set_aprice_total) {
                    set_aprice = set_aprice_total
               }
			   var get_node_qty = this._calc_accessories_node_qty(checkbox,node,selectedqty)

//			   var configPrice = parseFloat(currentprice) - ((currentsetprice)*node*currentsetqty) - current_aprice + (parseFloat(selectedConfigPrice)*node*selectedqty) + set_aprice
               var price = parseFloat(currentprice) - ((currentsetprice)*node*currentsetqty) - current_aprice +(parseFloat(selectedprice)*node*selectedqty) + set_aprice
               var total_price = parseFloat(currentTotalPrice) - ((currentSetTotalPrice)*node*currentsetqty) - current_aprice_total +(parseFloat(selectedTotalPrice)*node*selectedqty) + set_aprice_total
//               $('.session_price').find('.oe_currency_value').html((price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               $('.session_price').find('.oe_currency_value').html((price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               $('.subtotal_price').find('.session_total_price').html((total_price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
               checkbox.attr('data-price',selectedprice)
               checkbox.attr('data-total-price',selectedTotalPrice)
               checkbox.attr('data-qty',selectedqty)
               if ($('.div_main_form').find("input.config_attr_value[type='checkbox']:checked").attr('data-required-step')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-required-step'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && !$(this).find('.lead').length) {
                            $(this).find('.attr-name').append('<span class="lead lead-required-step">*</span>');
                        }
                    });
                }

               if ($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-dynamic-required-attributes')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-dynamic-required-attributes'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
                            $(this).find('.lead').addClass('d-none');
                        }
                    });
                }
           }
           else
           {
                var currentprice = parseFloat($('.session_price').find('.oe_currency_value').html().replace(/,/g, ''))
                var currentTotalPrice = parseFloat($('.subtotal_price').find('.session_total_price').html().replace(/,/g, ''))

//                var selectedConfigPrice = parseFloat(checkbox.parent().find('.oe_currency_value').html().replace(/,/g, '')) || parseFloat(checkbox.parent().find('.prod_sale_price').html().replace(/,/g, ''))
                var selectedprice = parseFloat(checkbox.parent().find('.oe_currency_value').html().replace(/,/g, ''))
                var selectedTotalPrice= parseFloat(checkbox.parent().find('.prod_sale_price').html().replace(/,/g, ''))
                if(!selectedprice && selectedTotalPrice){
                    selectedprice = selectedTotalPrice
                 } else if(!selectedTotalPrice && selectedprice) {
                    selectedTotalPrice = selectedprice
                 }
//                if(!selectedprice || !selectedTotalPrice){
//                    selectedprice = 0;
//                    selectedTotalPrice = 0;
//                 }

                var selectedqty= $(ev.currentTarget).parent().find("select[name='line_qty_"+checkbox.val()+"']").val()
                var set_aprice = this._calc_accessories_price(checkbox,node,selectedqty)
                var set_aprice_total = this._calc_accessories_total_price(checkbox,node, selectedqty)
                if(!set_aprice_total && set_aprice){
                    set_aprice_total = set_aprice
                } else if(!set_aprice && set_aprice_total) {
                    set_aprice = set_aprice_total
                }
                var get_node_qty = this._calc_accessories_node_qty(checkbox,node,selectedqty)

//                var configPrice = parseFloat(currentprice) - (parseFloat(selectedConfigPrice)*node*selectedqty) - set_aprice
                var price = parseFloat(currentprice)-(parseFloat(selectedprice)*node*selectedqty) - set_aprice
                var total_price = parseFloat(currentTotalPrice) - (parseFloat(selectedTotalPrice)*node*selectedqty) - set_aprice_total
                $('.session_price').find('.oe_currency_value').html((price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
//                $('.session_price').find('.oe_currency_value').html((configPrice.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                $('.subtotal_price').find('.session_total_price').html((total_price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                checkbox.attr('data-price',0.0)
                checkbox.attr('data-aprice-total',0.0)
                checkbox.attr('data-qty',1)
                // removed required icon of required another steps
                if ($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-required-step')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-required-step'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length && !$('input.config_attr_value:checked').length) {
                            $(this).find('.attr-name span.lead').remove();
                        }
                    });
                }

                // add validation for dynamic required step group
                if ($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-dynamic-required-attributes')) {
                    var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value[type='checkbox']").attr('data-dynamic-required-attributes'))
                    $('li.attribute_container.attribute_select').each(function(){
                        if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
                            $(this).find('.lead').removeClass('d-none');
                        }
                    });
                }
                selQtyBox.val('0');
           }
           if($('input[name="is_sub_steps"]').length){
                this._manageSelControllerVisibility();
           }
           $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
           if($("input.config_attr_value[type='checkbox']:checked").length<1){
                var isNegative = $('div.you_save_block .oe_currency_value').text().includes('-')
                if(parseFloat($('div.you_save_block .oe_currency_value').text()) <= 0 || isNegative){
                    $(".you_save_block").addClass("d-none");
                }
           }
           else{
                if(parseFloat($('div.you_save_block .oe_currency_value').text()) > 0){
                    $(".you_save_block").removeClass("d-none");
                }
           }
           var allCheckBoxes = $('#div_main_form').find('.config_attr_value[name='+checkbox.attr("name")+']').filter(':checked');
            if(allCheckBoxes.length == 0) {
                $('#main_form').find('.js_reset_attribute').click();
                checkbox.parents('.selected_controller_step').find('.mark-done').addClass('d-none');
                $('.attribute_container[attribute_line_id='+checkbox.attr('attrb_line-id')+'] .mark-done').addClass('d-none')
            }
        },
        _onClickControllerClose: function(ev){
            var closedController = $(ev.currentTarget).siblings('span.controller-tag-name').html();
            $(ev.currentTarget).parents('span').remove();
            $('input[controller-name="' + closedController + '"]:checked').each(function (){
                $(this).prop('checked', false);
                $(this).parents('.info_config_attr_value_radio').find('.component_accessories .js_accessories_input').prop('checked', false);
            });
            if ($('.div_main_form').find("input.config_attr_value").attr('data-dynamic-required-attributes')) {
                var attributes = JSON.parse($('.div_main_form').find("input.config_attr_value").attr('data-dynamic-required-attributes'))
                $('li.attribute_container.attribute_select').each(function() {
                    if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length) {
                        $(this).find('.lead').removeClass('d-none');
                    }
                });
            }
        },
        _onAddExtraRaidLine: function(ev){
            var param = {}
            var raidRow = $(ev.currentTarget).parents('.raid_table_row')
            param.raid_id = raidRow.find('input[name="raid_comp_id"]').val()
            param.sel_qty = raidRow.find('div.sel_total_qty option:selected').val()
            param.raid_level = raidRow.find('div.raid_levels option:selected').val()
            param.raid_qty = raidRow.find('div.raid_qty option:selected').val()
            param.hot_spares = raidRow.find('div.hot_spares option:selected').val()
            param.config_session = $('input#current_config_session').val()
            this._verifyAddVisibility();
            if (!param.raid_level || param.raid_level == "") {
                var dialog = new Dialog(this, {
                    size: 'medium',
                    title: 'Warning',
                    $content:_t("<p class='ml-0'>Please select RAID Level.</p>"),
                })
                dialog.open()
                return;
            }
            ajax.jsonRpc('/product-configure/add-raid-line','call',param).then(function(data) {
                if(data.render_form){
                    if(!raidRow.next('.raid_table_row').length){
                        raidRow.after(data.render_form);
                        raidRow.find('.add_extra_raid_line').remove();
                        raidRow.find('.remove_extra_raid_line').remove();
                    }
                }
            });
        },
        _verifyAddVisibility() {
            var selected_qty = 0
            var rows = $("div.attr-raid-setup").find('div.raid_table_row');
            rows.each(function() {
                selected_qty += parseInt($(this).find('select[name="raid_qty"]').find(':selected').val());
                selected_qty += parseInt($(this).find('select[name="hot_spares"]').find(':selected').val());
            });
            var raid_qty = parseInt($(rows[0]).find('select[name="total_comp_qty"]').find(':selected').val());
            if (raid_qty == selected_qty) {
                rows.each(function() {
                    $(this).find('span.add_extra_raid_line').addClass('d-none');
                });
            }
        },
        _verifyAddVisibilityOnStepChange() {
            var rows = $("div.attr-raid-setup").find('div.raid_table_row');
            var lastIndex = rows.length - 1;
            rows.each(function(index)
            {   if (index != lastIndex) {
                    $(this).find('span.add_extra_raid_line').remove();
                    $(this).find('span.remove_extra_raid_line').remove();

                }
            });
        },
        _onRemoveExtraRaidLine: function(ev){
            var raidRow = $(ev.currentTarget).parents('.raid_table_row')
            var prevRow = raidRow.prev('.raid_table_row')
            if(prevRow){
                raidRow.remove()
                if(!prevRow.hasClass('base_rec')){
                    prevRow.find('.add-remove-btn-block').append(
                      '<span class="add_extra_raid_line btn btn-primary btn-sm ml-2 mr-3 px-2 py-1">Add</span><span class="remove_extra_raid_line btn btn-primary btn-sm px-2 py-1">Remove</span>'
                    )
                } else{
                    prevRow.find('.add-remove-btn-block').append(
                      '<span class="add_extra_raid_line btn btn-primary btn-sm ml-2 mr-3 px-2 py-1">Add</span>'
                    )
                }
            }
        },

        _onClickSupercapBox: function(ev){
            if($(ev.currentTarget).prop("checked")){
               $(ev.currentTarget).parents('.heading_selection').find('.supercap_accessory_div').removeClass('d-none')
            } else {
               $(ev.currentTarget).parents('.heading_selection').find('.supercap_accessory_div').addClass('d-none')
            }
        },

        _changeControllerRaidSelection: function(ev) {
            var selAccessory = $(ev.currentTarget).find(':selected')
            var supercapTag = selAccessory.parents('.component_configs').find('.supercap-controller')
            // Supercap tag management
            selAccessory.attr('type') == 'supercap' ? supercapTag.removeClass('d-none') : supercapTag.addClass('d-none')
            // Raid setup step visibility
            var flag = 0
            $('div.component_configs').not('.d-none').find('select.controller_raid_selection').each(function (){
                if($(this).val()){
                    flag = 1
                }
            })
            flag ? $('#raid_setup_block').removeClass('d-none') : $('#raid_setup_block').addClass('d-none')
            $(ev.currentTarget).val() && $('#you_save_price_warning_div').removeClass('d-none')
        },

        _changeSelectDriveTypes: function(ev) {
            var selDriveId = $(ev.currentTarget).find(':selected').val()
            if(selDriveId != 0){
                $(ev.currentTarget).closest('.component_configs').find('.search_component').removeClass('d-none');
            }
            else{
                $(ev.currentTarget).closest('.component_configs').find('.search_component').addClass('d-none');
            }
            this._manageCompVisibility($(ev.currentTarget))
        },

        _onClickAddStorageContoller: function(ev) {
            var params = {}
            var totalAddOnControllers = []
            var addedExtraControllers = []
            $('input[name="add_on_controller_id"]').each(function (){
                if($(this).val()){
                    var temp = JSON.parse($(this).val());
                    temp.forEach(function(value) {
                        totalAddOnControllers.push(value)
                    })
                }
            })
            $('input[name="extra_controller_id"]').each(function (){
                if($(this).val()){
                    addedExtraControllers.push($(this).val())
                }
            })
            params.total_controllers = totalAddOnControllers
            params.added_controllers = addedExtraControllers
            ajax.jsonRpc('/product-configure/add-on-controller-pop-up','call',params).then(function(data) {
                if(data){
                    $("#add_on_pop_up").html(data);
                    $('#add_on_pop_up_sub').modal('show');
                }
            });
        },

        _onClickAddContollerPopUp: function(ev) {
            var self = this
            var params = {}
            var addOnCount = parseInt($('input[name="add_on_controller_count"]').val() || '0')
            if(addOnCount){
                if($('div.component_configs.add-on').length >= addOnCount){
                    var currentStep = $('li.attribute_select.active span.attr-name').text()
                    var dialog = new Dialog(this, {
	                   size: 'medium',
	                   title: 'Warning',
	                   $content:_t("<p class='ml-0'>You can add maximum " +addOnCount+ " Add-on controllers in " + currentStep + "</p>"),
	               })
	               dialog.open()
	               return;
                }
            }
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
            params.config_session = $('input[name="config_session_id"]').val()
            params.selected_controller = $('select[name="pop_up_controllers"] option:selected').val()
            params.current_active_step_line = $('li.attribute_select.active').attr('attribute_line_id')
            if(JSON.parse(params.selected_controller)){
                ajax.jsonRpc('/product-configure/add-add-on-controller','call',params).then(function(data) {
                    if(data){
                        var maxVal = 0;

                        $('input[name="add_on_number"]').each(function() {
                            if(parseInt($(this).val()) > maxVal){
                                maxVal = parseInt($(this).val())
                            };
                        });
                        $('.selected_controller_step:last').after(data.render_form);
                        if(maxVal){
                            $('input[name="add_on_number"]:last').val(maxVal+1);
                        } else {
                            $('input[name="add_on_number"]:last').val(1);
                        }
                        $('.drive_types').each(function(){
                            self._manageCompVisibility($(this));
                        })
                        $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                    }
                    $(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                });
                $("#add_on_pop_up_sub").modal('hide');
            } else {
                $('select[name="pop_up_controllers"]').css("border", "1px solid red");
                $(".cus_theme_loader_layout_config").addClass("d-none");
                $(".attribute_select").removeClass("loader");
            }
        },

        _onClickRemoveStorageContoller: async function(ev) {
            var controllerDiv =  $(ev.currentTarget).parents('.component_configs');
            var controllerParent = $(ev.currentTarget).parents('.selected_controller_step');
            var dataDiv = $(ev.currentTarget).parents('.component_configs')
            var params = $('.div_main_form').serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
            var selComponents = []
            dataDiv.find("input[name='attrib_val']:checked").each(function(){
                selComponents.push($(this).val())
            })
            params.controller_comp_id = dataDiv.find('select[name="storage_controller"] option:selected').val() || false
            params.raid_comp_id = dataDiv.find('select[name="controller_raid_selection"] option:selected').val() || false
            params.drive_id = dataDiv.find('.drive_types option:selected').val() || false
            params.parent_step_id = $('li.attribute_select.active').attr('attribute_id')
            params.controller_id = dataDiv.find('input[name="extra_controller_id"]').val() || false
            params.add_on_number = controllerDiv.find('input[name="add_on_number"]').val()
            params.sel_comps = selComponents
            await ajax.jsonRpc('/product-configure/remove-add-on-controller','call',params).then(function(data) {
                controllerDiv.find('.compatible_comps input.config_attr_value:checked').each(function(){
                    $(this).prop('checked', false);
                });
                controllerParent.remove();
            });
            this._manageSelControllerVisibility();
            if($('input[name="check_global_qty"]').val()){
                var tempQty = 0
                $('input.config_attr_value:checked').each(function (){
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
                        tempQty = tempQty + selQty
//                    }
                })
//                $('.component_configs.add-on').each(function(){
//                    $(this).find('.controller_raid_selection option:selected').each(function(){
//                        if($(this).val()){
//                            tempQty = parseInt(tempQty) + 1
//                        }
//                    })
//                    $(this).find('.storage_controller option:selected').each(function(){
//                        if($(this).val()){
//                            tempQty = parseInt(tempQty) + 1
//                        }
//                    })
//                })
                $('input#selected_attribute_qty').val(tempQty);
            }
            var allCheckBoxes = $('#div_main_form').find('.config_attr_value[attrb_line-id='+$(ev.currentTarget).attr("attrb_line-id")+']').filter(':checked');
            if(allCheckBoxes.length == 0) {
                $('#main_form').find('.js_reset_attribute').click();
                $(ev.currentTarget).parents('.selected_controller_step').find('.mark-done').addClass('d-none');
                $('.attribute_container[attribute_line_id='+$(ev.currentTarget).attr('attrb_line-id')+'] .mark-done').addClass('d-none')
            }
        },

        _onClickAddValueInSession: async function(ev) {
            var params = $('.div_main_form').serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
            var controllerDiv = $(ev.currentTarget).parents('.component_configs')
            var controllerSelectedVals = []
            var ControllerCompId = controllerDiv.find('select[name="storage_controller"] option:selected').val() || false
            var raidCompId = controllerDiv.find('select[name="controller_raid_selection"] option:selected').val() || false
            var controllerId = controllerDiv.find('input[name="extra_controller_id"]').val() || false
//            var selAttrb = controllerDiv.find('input[name="attrib_val"]:checked').filter(function() {
//                return !$(this).parents('.info_config_attr_value_radio').hasClass('d-none')
//            });
            var selAttrb = controllerDiv.find('input[name="attrib_val"]:checked')
            var selComponentsData = []
            if(!ControllerCompId){
                controllerDiv.find('select[name="storage_controller"]').css("border", "1px solid red");
                return;
            } else{
                controllerDiv.find('select[name="storage_controller"]').css("border", "");
            }
            if(!selAttrb.length){
                var dialog = new Dialog(this, {
	                   size: 'medium',
	                   title: 'Warning',
	                   $content:_t("<p class='ml-0'>To use add-on controllers, you must choose at least one component. If you don't want to choose any components, remove the add-on controller.</p>"),
	               })
	               dialog.open()
	               return;
            }

            params.current_active_step_line = $('li.attribute_select.active').attr('attribute_line_id')

            selAttrb.each(function(){
                var accessoryArray = []
                var selQty = $(this).parents('.attrib_label').find('.line_qty_box option:selected').val()
                $(this).parents('.info_config_attr_value_radio').find('input.js_accessories_input:checked').each(function(){
                    accessoryArray.push($(this).val())
                })
                selComponentsData.push({'comp': $(this).val(), 'step': $(this).attr('data-attrb_id'), 'accessories': accessoryArray, "sel_qty":selQty})
            })
            controllerSelectedVals.push({'data': selComponentsData, 'controller_comp_id':ControllerCompId, 'raid_comp_id': raidCompId})
            params.controller_selected_vals = JSON.stringify(controllerSelectedVals)
            params.controller_id = controllerId
            params.from_add_button = true
            params.add_on_number = controllerDiv.find('input[name="add_on_number"]').val()
            params.parent_step_id = $('li.attribute_select.active').attr('attribute_id')

            // supercap data
            var supercapArr = []
            var supercapDiv = controllerDiv.find('input.is_supercap')
            var selCompAcc = controllerDiv.find('.controller_supercap_acc option:checked').val() || false
            if(supercapDiv.length > 0 && supercapDiv[0].checked){
                if(!supercapDiv.siblings('.supercap_accessory_div').find('.controller_supercap_acc option:selected').val()){
                    var dialog = new Dialog(this, {
	                   size: 'medium',
	                   title: 'Warning',
	                   $content:_t("<p class='ml-0'>Selection of Supercap accessory is required if the controller's Supercap checkbox is checked.</p>"),
	               })
	               dialog.open()
	               return;
                }
                supercapArr.push({'is_supercap': true, 'sel_accessory': selCompAcc, 'controller_id':supercapDiv.attr('controller-id'), 'add_on_number': controllerDiv.find('input[name="add_on_number"]').val()});
            } else {
                supercapArr.push({'is_supercap': false, 'controller_id':supercapDiv.attr('controller-id')})
            }

//            selected_attrib_val
            var selected_attrib_data = {}
            $("input[name='attrib_val']:checked").each(function(){
                var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                    if($(this).val() in selected_attrib_data){
                        selected_attrib_data[$(this).val()] += selQty
                    } else {
                        selected_attrib_data[$(this).val()] = selQty
                    }
//                }
            });
            params.selected_attrib_val = JSON.stringify(selected_attrib_data)
            // Resource Limitation
            await ajax.jsonRpc('/verify_session_limitations','call', params).then(function(data) {
                if(data.error){
                    var dialog = new Dialog(this, {
                           size: 'medium',
                           title: 'Alert',
                           $content:_t(data.error),
                       })
                       dialog.open()
                       $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                    flag_error = 1;
                }
            });

            params.supercap_data = JSON.stringify(supercapArr);
//            params.sel_drive_id = controllerDiv.find('.drive_types option:selected').val()
            // manage GQT vals
            if($('input[name="check_global_qty"]').val()){
                var tempQty = 0
                var tempArrayCompQty = {}
                var tempArrayAccQty = {}
                $('input.config_attr_value:checked').each(function (){
                    params.sel_drive_id = $(this).attr('drive-id')
                    var child_step_line = $(this).parents('.info_config_attr_value_radio').find('#child_step_line_id').val()
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
                        tempQty = tempQty + selQty
                        if(child_step_line in tempArrayCompQty){
                            tempArrayCompQty[child_step_line] += selQty
                        } else {
                            tempArrayCompQty[child_step_line] = selQty
                        }
                        $(this).parent().siblings('.component_accessories:not(".d-none")').find('.js_accessories_items [data-global-check][data-attrb_id]:checked').each(function(){
                            var aqty = parseInt($(this).siblings().find('.accessories_qty').html());
                            if(child_step_line in tempArrayAccQty){
                                tempArrayAccQty[child_step_line] += aqty
                            } else {
                                tempArrayAccQty[child_step_line] = aqty
                            }
                        })
//                    }
                })
//                $('.component_configs.add-on').each(function(){
//                    $(this).find('.controller_raid_selection option:selected').each(function(){
//                        if($(this).val()){
//                            tempQty = parseInt(tempQty) + 1
//                        }
//                    })
//                    $(this).find('.storage_controller option:selected').each(function(){
//                        if($(this).val()){
//                            tempQty = parseInt(tempQty) + 1
//                        }
//                    })
//                })
                params.selected_attribute_qty = tempQty
                params.child_gqt_vals = JSON.stringify(tempArrayCompQty)
                params.child_gqt_acc_vals = JSON.stringify(tempArrayAccQty)
            }
            //
            $.ajax({
                url:'/product-configure/attribute-value-save',
                type: 'POST',
                data: params,
                async: false,
                success: function(data){
                    data=JSON.parse(data)
                    if(data.data){
                        $(ev.currentTarget).addClass('d-none');
                        $('input#selected_attribute_qty').val(tempQty);
                        $(ev.currentTarget).parents('.component_configs').css("pointer-events", "none");
                        $(ev.currentTarget).parents('.component_configs').find('.remove_storage_controllers').css('pointer-events', 'auto');
                        $(ev.currentTarget).parents('.component_configs').find('.search_component').css('pointer-events', 'auto');
                    }
                    else{
                        if(data.child_step_warning){
                            if(data.child_acc_gqt_warning){
                                var message = "<div><p> You have reached the maximum number of accessories allowed.</p> <p> You can only add a total of <b>" + data.max_allowed_qty + "</b> accessories From <b>" + data.step_name + "</b>.</p></div>"
                            } else {
                                var message = "<div><p> You have reached the maximum number of components allowed.</p> <p> You can only add a total of <b>" + data.max_allowed_qty + "</b> components From <b>" + data.step_name + "</b>.</p></div>"
                            }
                            var dialog = new Dialog(this, {
                               size: 'medium',
                               title: 'Warning',
                               $content:_t(message)
    //                           $content:_t("<p class='pt-3 pb-3'>You have reached the maximum number of components allowed.</p><ul class='mr-3 mb-0'> <li class='pb-3'>In <span>" + data.step_name + "</span>, You can only add a total of <span>" + data.max_allowed_qty + "</span> components.</li></ul><p class='pb-3'>Click the Reset Step, next to the Search box, to start over.</p>")
    //                           $content:_t("<p class='ml-0'>Maximum number of add-on controllers has been reached for the <b>" + data.step_name + "</b> step. QTY: " + data.max_allowed_qty + "</p>"),
                            })
                            dialog.open()
                        } else {
                            $("#error-save-session").modal({keyboard: true});
                            $("#error-save-session .error-save-session-msg").html("error-save-session-msg");

                        }
                        $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                    }
                }
            });
        },

        // Change the price while changing the attribute quantity
        _onClickLineQtyBox : function(ev) {
            var select_attrb = $(".config_attr_value[value='"+parseInt($(ev.currentTarget).attr('data-attrib-id'))+"']");
            select_attrb.each(function(value) {
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length && $(this).is(':checked')){
                if($(this).is(':checked')){
                    $(this).trigger('change');
                }
            })
        },

        //While clicking on configuration button in shop page
        _onClickConfigForm : function(ev) {
            ev.preventDefault();
            var p_id = $(ev.currentTarget).attr('product_id')
            $.ajax({
                  url:'/product-configure',
                  type: 'GET',
                  data: {'product_id':p_id},
                  async: false,
                  success: function(data){
                      $(".cus_theme_loader_layout_config").addClass("d-none");
                      $(".attribute_select").removeClass("loader");
                      data=JSON.parse(data)
                      document.location=data['redirect_url']
                      return true
                  },
                  error: function(data) {
                     console.log('An error occurred.');
                     $(".cus_theme_loader_layout_config").addClass("d-none");
                     $(".attribute_select").removeClass("loader");
                  },
            });
         },

       // Print the current page
       _onClickPrint : function(ev) {
       	   var ele = $('#wrapwrap').children(':not("main")')
       	   $('.o_main_navbar').length > 0 ? $('.o_main_navbar').addClass('d-print-none') : false
       	   ele.addClass('d-print-none')
           window.print()
           ele.removeClass('d-print-none')
           $('.o_main_navbar').length > 0 ? $('.o_main_navbar').removeClass('d-print-none') : false
           return false
       },

       // Validate the current node
       _validateCurrentNode : function(){
            return true
        },

        // Print the current configuration
        _onClickPrintConfig : function(ev) {
            $('.js_validate_configuration').first().trigger('click',{'print':true})
        },

        // Redirect to the configure page
        _onClickJsConfig : function(ev) {
             $.ajax({
                  url:'/product-configure',
                  type: 'GET',
                  data: {'product_id':$(".js_config_product").val()},
                  async: false,
                  success: function(data){
                      $(".cus_theme_loader_layout_config").addClass("d-none");
                      $(".attribute_select").removeClass("loader");
                      data=JSON.parse(data)
                      document.location=data['redirect_url']
                      return true
                  },
                  error: function(data) {
                     console.log('An error occurred.');
                     $(current_attrib).next('li').click()
                       $(".cus_theme_loader_layout_config").addClass("d-none");
                       $(".attribute_select").removeClass("loader");
                  },
            });
        },

        // "Configure Same Node" and "Independent Node" Switching
        _onClickConfigureNode : function(ev) {
        	$(".cus_theme_loader_layout_config").removeClass("d-none");
        	$(".attribute_select").addClass("loader");
            var process_info = confirm("This will clear all selections. Do you wish to proceed?");
            if(process_info)
            {
                var session_master_id = $(ev.currentTarget).attr('session_master_id')
                ajax.jsonRpc('/product-configure/configure-node','call',{'session_master_id':session_master_id}).then(function(data) {
                	$(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                	if(!data){
                	return
                	}
                    if(data && data.same_configure_node == '1')
                        {
                        $(ev.currentTarget).text("CONFIGURE NODES INDEPENDENTLY")
                        $(".total-node-selection").addClass("d-none")
                        $(".node").addClass("d-none")
                        $(ev.currentTarget).attr("same_configure_node","1")
                        $(".session_config_nodes").addClass('config_nodes').removeClass('same_config_nodes')
                        }
                    if(data && data.same_configure_node != '1')
                    {
                        $(ev.currentTarget).text("CONFIGURE ALL NODES THE SAME")
                        $(".total-node-selection").removeClass("d-none")
                        $(".node").removeClass("d-none")
                        $(ev.currentTarget).attr("same_configure_node","0")
                         $(".session_config_nodes").addClass('same_config_nodes').removeClass('config_nodes')
                     }
                  $(".active-node").html("Node 1")
                  $('.node .active-node').attr('data-session-id',data.session_id)
                  $('.node .active-node').attr('data-node',1)
                  $(".js_reset_node").trigger('click')
                  $('.total-node-selection .perv-node').addClass('d-none')
                  $('.total-node-selection .next-node').removeClass('d-none')
                });
            }
            else{
            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
            }
        },
        _onClickConfigUpdateCart : function(ev) {
            var is_policy_accept = $("input[name='is_policy_accepted']").is(':checked')
            if(is_policy_accept == false){
                Dialog.confirm(ev,
                ("You must review and accept our Returns Policy before you can buy a custom configured server."),
                {
                        size: 'medium',
                        title: ("Warning"),
                        renderHeader: true,
                        buttons: [{
                            text: ("CLOSE"),
                            classes: 'btn btn-primary conf_button yes mb0',
                            close: true
                        }]
                });
                return false;
            }
        },

        // ADD TO CART the current master session
        _onClickConfigAddCart : function(ev) {
            var is_policy_accept = $("input[name='is_policy_accepted']").is(':checked')
            if(is_policy_accept == false){
                Dialog.confirm(ev,
                ("You must review and accept our Returns Policy before you can buy a custom configured server."),
                {
                        size: 'medium',
                        title: ("Warning"),
                        renderHeader: true,
                        buttons: [{
                            text: ("CLOSE"),
                            classes: 'btn btn-primary conf_button yes mb0',
                            close: true
                        }]
                });
                return false;
            }
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
            var session_master_id = $(ev.currentTarget).attr('session_master_id')
            ajax.jsonRpc('/product-configure/add-to-cart-session-master','call',{'session_master_id':session_master_id}).then(function(data) {
                 if(data){
                    $(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                    window.location.href = '/shop/cart';
                 }
                 else{
                    var dialog = new Dialog(this, {
	                   size: 'medium',
	                   title: 'Configuration Check',
	                   $content:_t("<p class='ml-0'>A required component is not selected, please make a selection before add an item to shopping cart.</p>"),
	               })
	               dialog.open()
                 }
            });
            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
        },

        // Validate the current master session
        _onClickValidateConfig : function(ev,args) {
        $(".cus_theme_loader_layout_config").removeClass("d-none");
        $(".attribute_select").addClass("loader");
            var session_master_id = $(ev.currentTarget).attr('session_master_id')
            var attrib = $("ul").find("[attribute_line_id='0']");
            var current_session_input = $('#current_session_input').val() ? JSON.parse($('#current_session_input').val()) : []
            $.each(current_session_input, function (i, val) {
                $('.attribute_select[attribute_id=' + val + ']').addClass('restricted')
                $('.restricted').find('.mark-done').removeClass('d-none')
            });
            attrib.click()
            ajax.jsonRpc('/product-configure/validate-session-master','call',{'session_master_id':session_master_id}).then(function(data) {
                 if(data){
                    $(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                    var url =  '/my/product-configurator/'+session_master_id;
                    if (typeof args !== 'undefined' && args.print > 0)
                     {url = url + '?print=true'
                     }
                    window.location.href = url;
                 }
                 else{
                    var dialog = new Dialog(this, {
	                   size: 'medium',
	                   title: 'Configuration Check',
	                   $content:_t("<p class='ml-0'>A required component is not selected, please make a selection.</p>"),
	               })
	               dialog.open()
	               $(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                 }
            });
            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");

        },


        // Reset the current node
        _onClickResetAttribute : async function(ev) {
            var is_sub_step = false
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
            if($('input[name="is_sub_steps"]').length){
                is_sub_step = true;
            }
            /* Remove quantity limitation of the current attribute if applicable */
            var current_session_id = $('.node .active-node').attr('data-session-id')
            var attribute_line_id = $(ev.currentTarget).attr('attribute_line_id')
            await ajax.jsonRpc('/product-configure/reset-step','call',{
                'current_session_id':current_session_id,
                'attribute_line': attribute_line_id,
                'is_sub_step': is_sub_step
            }).then(function(data) {
                if(data.is_required_anothor_step){
                    $(".lead.lead-required-step").addClass('d-none')
                }
            });
            $(ev.currentTarget).parents('.cfg_step_attribute_tabs').find(':input','.div_main_form').not(':button, :submit, :reset, :disabled').prop('checked', false);
            /*$(':input','.div_main_form').not(':button, :submit, :reset, :hidden ,:disabled').prop('checked', false);*/
            /*if ($(ev.currentTarget).attr('data-disable-step')) {
                $('.attribute_container.attribute_select').each(function(){
                    if($(this).attr('data-disable-step') == $(ev.currentTarget).attr('data-disable-step')){
                        //$(this).removeClass('restricted');
                    }
                });
            }*/
            $(ev.currentTarget).parents('.cfg_step_attribute_tabs').find('.config_attr_value').each(function(){
                $(this).removeAttr('disabled')
            })
            var attribute_line_id = $(ev.currentTarget).attr('attribute_line_id')
            var ele = $("ul").find("[attribute_line_id='" + attribute_line_id + "']");
            ele.find('.mark-done').addClass('d-none')
            $(ev.currentTarget).parents('.cfg_step_attribute_tabs').find('.mark-done').addClass('d-none')
            $('input#selected_attribute_qty').val('0')
            // add validation for required step
            var attributes = JSON.parse($('.div_main_form').find("input[type='radio']").attr('data-required-step') || '[]')
            $('li.attribute_container.attribute_select').each(function(){
                if (attributes.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead-required-step').length) {
                    $(this).find('.lead-required-step').remove();
                }
            });
            var attributes = JSON.parse($('.div_main_form').find("input[type='radio'],input[type='checkbox']").attr('data-dynamic-required-attributes') || '[]')
            $('li.attribute_container.attribute_select').each(function(){
                if (attributes.includes(parseInt($(this).attr('data-required-step')))) {
                    $(this).find('.lead').removeClass('d-none');
                }
            });
            ele.click()
            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
        },

        // Reset the current node
        _onClickReset : async function(ev) {
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
            var current_session_id = $('.node .active-node').attr('data-session-id')
            $('.attribute_container.attribute_select.restricted').removeClass('restricted');
            await ajax.jsonRpc('/product-configure/reset-node','call',{'current_session_id':current_session_id}).then(function(data) {
                 if(data){
                      $('#main_form').empty()
                      $('.main_form_mobile').empty()
                      $(".lead.lead-required-step").remove();
                      $(".attribute_select").first().trigger('click')
                      $(".attribute_select").addClass("loader");
                      $(".cus_theme_loader_layout_config").addClass("d-none");
                      $(".mark-done").addClass("d-none");
                      $(".attribute_select").removeClass("loader");
                 }
            });
            $('li.attribute_container.attribute_select').each(function(){
                $(this).find('.lead').removeClass('d-none');
            });
            // Remove You Save
            $('.you_save_block').addClass('d-none');
        },

       // call the current form submit event and trigger the next or previous element click
       _onClickButton: async function(ev) {
            ev.preventDefault();
            var form = $('.div_main_form')
            var is_valid = this._validateCurrentNode()
            if($('.cfg_step_header').find('.max_warning').length > 0){
            	$('.max_warning').removeClass('alert-warning').addClass('alert-primary')
            }
            if (!is_valid){
                if($('.cfg_step_header').find('.max_warning').length > 0){
                	$('.cfg_step_header').find('.max_warning').addClass('alert alert-warning').removeClass('alert-primary')
                }
                return false
            }
            // SuperCap Warning
            var showSupercapWarning = false
            $('div.component_configs').not('.d-none').find('input.is_supercap').each(function (){
                if(this.checked && !$(this).siblings('.supercap_accessory_div').find('.controller_supercap_acc option:selected').val()){
                    showSupercapWarning = true
                    return;
                }
            })
            if(showSupercapWarning){
                var dialog = new Dialog(this, {
                   size: 'medium',
                   title: 'Warning',
                   $content:_t("<p class='ml-0'>Selection of Supercap accessory is required if the controller's Supercap checkbox is checked.</p>"),
                })
                dialog.open()
                return;
            }
            var attrib_line = $('li.attribute_select.active').attr('attribute_line_id')
            var attrib = $('li.attribute_select.active').attr('attribute_id')
//            $('#node-accordion .nav-pills').find('.nav-item').removeClass('active');
            var attribute_line_id = $(ev.currentTarget).attr('attribute_line_id')
            var current_attrib = $("ul").find("[attribute_line_id='" + attribute_line_id + "']");

//            var attrib = $(form).find("input[name='attribute_line_id']").val()
            var selected_accessory = [];
            var attrib_val = [];
            var check_selected_accessory = 0;
            var check_accessory = false

            /* ToDo: accessory required process */
            $("input[name='attrib_val']:checked").each(function(){
                if ($(this).attr('dependent-required-component')) {
                    attrib_val.push(($(this).val()));
                    check_accessory = true;
                    var accessories = $(this).parents('.attrib_label').siblings('.component_accessories').find('.js_accessories_input:checked').filter(function() {
                        return !$(this).parents('.component_accessories').hasClass('d-none')
                    });
                    accessories.each(function(){
                        selected_accessory.push($(this).val());
                    });
                }
            });
            /* ToDo: ajax call*/
            var accessories_data = {'selected_accessory': selected_accessory, 'line': attrib_line, 'attrib_val': attrib_val}
            var flag_error = 0;
            check_accessory && await ajax.jsonRpc('/verify_required_dynamic_accessory','call', accessories_data).then(function(data) {
                 if(data.error){
                    var dialog = new Dialog(this, {
						   size: 'medium',
						   title: 'Alert',
						   $content:_t(data.error),
					   })
					   dialog.open()
					   $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
					flag_error = 1;
                 }
            });
            /* Limitation Error Message */
            if (!flag_error) {
                /*get data */
                var attrib_line = attrib_line || $(form).find("input[name='attribute_line_id']").val()
                var req = $(form).find("input[name='is_required']").val()
                var params = {}
                var params = $(form).serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
                var selected_attrib_data = {}
                $("input[name='attrib_val']:checked").each(function(){
                    var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        if($(this).val() in selected_attrib_data){
                            selected_attrib_data[$(this).val()] += selQty
                        } else {
                            selected_attrib_data[$(this).val()] = selQty
                        }
//                    }

                });
                params.parent_step_id = attrib || $('li.attribute_select.active').attr('attribute_id')
                params.selected_attrib_val = JSON.stringify(selected_attrib_data)
                if ($(form).find('input[name="attrib_val"]').length) {
                    await ajax.jsonRpc('/verify_session_limitations','call', params).then(function(data) {
                        if(data.error){
                            var dialog = new Dialog(this, {
                                   size: 'medium',
                                   title: 'Alert',
                                   $content:_t(data.error),
                               })
                               dialog.open()
                               $(".cus_theme_loader_layout_config").addClass("d-none");
                               $(".attribute_select").removeClass("loader");
                            flag_error = 1;
                        }
                    });
                }
            }
            if (!flag_error || !attrib_line) {
                if (this._onSubmitForm($(form))) {
                    $(current_attrib).addClass('active').click();
                }
                else {
                    var data = JSON.parse(res_data.data)
//                    if(data.child_step_warning){
//                        var dialog = new Dialog(this, {
//                           size: 'medium',
//                           title: 'Warning',
//                           $content:_t("<div><p> You can only add a total of <b>" + data.max_allowed_qty + "</b> components From <b>" + data.step_name + "</b>.</p><p class='pb-3'>Click the Reset Step, Next to the Search box, To start over.</p></div>")
////                           $content:_t("<p class='pt-3 pb-3'>You have reached the maximum number of components allowed.</p><ul class='mr-3 mb-0'> <li class='pb-3'>In <span>" + data.step_name + "</span>, You can only add a total of <span>" + data.max_allowed_qty + "</span> components.</li></ul><p class='pb-3'>Click the Reset Step, next to the Search box, to start over.</p>")
////                           $content:_t("<p class='ml-0'>Maximum number of add-on controllers has been reached for the <b>" + data.step_name + "</b> step. QTY: " + data.max_allowed_qty + "</p>"),
//                        })
//                        dialog.open()
//                        $(".cus_theme_loader_layout_config").addClass("d-none");
//                            $(".attribute_select").removeClass("loader");
//                    } else {
//                        $("#error-save-session").modal({keyboard: true});
//                        $(".cus_theme_loader_layout_config").addClass("d-none");
//                            $(".attribute_select").removeClass("loader");
//                    }
                    $("#error-save-session").modal({keyboard: true});
                    $(".cus_theme_loader_layout_config").addClass("d-none");
                    $(".attribute_select").removeClass("loader");
                }
            }
       },

        _getSupercap: function(){
            var is_supercap = $('.component_configs:not(.add-on)').find('input.is_supercap').length;
            if (is_supercap) {
                var supercapArr = [];
                $('.component_configs:not(.add-on)').find('input.is_supercap').each(function (i){
                    var data = {}
                    data.controller_id = this.getAttribute('controller-id');
                    data.is_supercap = this.checked;
                    data.sel_accessory = $(this).siblings('.supercap_accessory_div').find('.controller_supercap_acc option:selected').val() || false
                    supercapArr.push(data);
                });
                return supercapArr;
            }
        },

        // main submit event the form and store the value with ajax call (async method)
        _onSubmitForm: function(form) {
            var isRaidSetupPage = $('div.attr-raid-setup').length;
            if(isRaidSetupPage){
                var raidArray = []
                var params = {}
                $('div.raid_table_row').each(function (i){
                    var temp = {}
                    temp.raid_id = $(this).find('input[name="raid_comp_id"]').val()
                    temp.sel_total_qty = $(this).find('.sel_total_qty option:selected').val()
                    temp.raid_levels = $(this).find('.raid_levels option:selected').val()
                    temp.raid_qty = $(this).find('.raid_qty option:selected').val()
                    temp.hot_spares = $(this).find('.hot_spares option:selected').val()
                    temp.base_rec = JSON.stringify($(this).hasClass('base_rec') || false)
                    raidArray.push(temp)
                });
                if(raidArray.length){
                    params.data = JSON.stringify(raidArray)
                } else {
                    params.data = ''
                }
                params.config_session = $('input#current_config_session').val()
                params.is_raid = isRaidSetupPage
                $.ajax({
                      url:'/product-configure/attribute-value-save',
                      type: 'POST',
                      data: params,
                      async: false,
                      success: function(data){}
                });
                return {'res': 1};
            } else{
                $(".cus_theme_loader_layout_config").removeClass("d-none");
                $(".attribute_select").addClass("loader");
                var params = {}
                var attrib = $(form).find("input[name='attribute_line_id']").val()
                var req = $(form).find("input[name='is_required']").val()
                var is_sub_step = $('input[name="is_sub_steps"]').length
                var current_attrib = $("ul").find("[attribute_line_id='" + attrib + "']");
                var test_return = 1;

                /* ToDo : prepare data */
                /* Bug FIX : https://github.com/emipro/wiredzone/issues/5023#issuecomment-1640823488 */
                /* Changes for make request POST type instead of GET due to issue with the more data */
                var params = $(form).serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
                var selected_attrib_val = []
                var selected_attrib_val2 = []
                var selControllerRaid = []
                $("input[name='attrib_val']:checked").each(function(){
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        selected_attrib_val.push(($(this).val()))
//                    }
                });
                $("input[name='attrib_val']:checked").each(function(){
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        if(!$(this).parents('.component_configs').hasClass('add-on')){
                            var accessoryArray = []
                            var selQty = $(this).parents('.attrib_label').find('.line_qty_box option:selected').val()
                            $(this).parents('.info_config_attr_value_radio').find('input.js_accessories_input:checked').each(function(){
                                accessoryArray.push($(this).val())
                            })
                            var SelRaidCompId = $(this).parents('.component_configs').find('.controller_raid_selection option:selected').val() || false
                            var SelControllerId = $(this).parents('.component_configs').find('select[name="storage_controller"] option:selected').attr('controller') || false
//                            var SelDriveId = $(this).parents('.component_configs').find('.drive_types option:selected').val() || false
                            var SelDriveId = $(this).attr('drive-id') || false
                            SelControllerId && SelRaidCompId && selControllerRaid.push(SelRaidCompId)
                            selected_attrib_val2.push({'comp': $(this).val(), 'step': $(this).attr('data-attrb_id'), 'accessories': accessoryArray, "sel_qty":selQty, "controller_raid_selection": SelRaidCompId, "controller_id": SelControllerId, "sel_drive_id": SelDriveId})
                        }
//                    }
                });
                params.selected_attrib_val = JSON.stringify(selected_attrib_val)
                params.selected_attrib_val2 = JSON.stringify(selected_attrib_val2)

                params.current_active_step_line = $('li.attribute_select.active').attr('attribute_line_id')
                if(is_sub_step){
                    var controllerSelectedVals = []
                    if(selControllerRaid.length){
                        params.sel_controller_raid = JSON.stringify(selControllerRaid)
                    }
                    $('.component_configs.add-on').each(function(){
                        var compId = $(this).find('select[name="storage_controller"] option:selected').val() || false
                        var raidCompId = $(this).find('select[name="controller_raid_selection"] option:selected').val() || false
                        compId && raidCompId && controllerSelectedVals.push({'comp_id':compId, 'raidCompId': raidCompId});
                    });
                    params.controller_selected_vals = JSON.stringify(controllerSelectedVals)
                    params.parent_step_id = $('li.attribute_select.active').attr('attribute_id')
                    // Manage GQT values
                    if($('input[name="check_global_qty"]').val()){
                        var tempQty = 0
                        var tempArrayCompQty = {}
                        var tempArrayAccQty = {}
                        $('input.config_attr_value:checked').each(function (){
                            var child_step_line = $(this).parents('.info_config_attr_value_radio').find('#child_step_line_id').val()
//                            if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                                var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
                                tempQty = tempQty + selQty
                                if(child_step_line in tempArrayCompQty){
                                    tempArrayCompQty[child_step_line] += selQty
                                } else {
                                    tempArrayCompQty[child_step_line] = selQty
                                }
                                $(this).parent().siblings('.component_accessories:not(".d-none")').find('.js_accessories_items [data-global-check][data-attrb_id]:checked').each(function(){
                                    var aqty = parseInt($(this).siblings().find('.accessories_qty').html());
                                    if(child_step_line in tempArrayAccQty){
                                        tempArrayAccQty[child_step_line] += aqty
                                    } else {
                                        tempArrayAccQty[child_step_line] = aqty
                                    }
                                })
//                            }
                        })
//                        $('.component_configs.add-on').each(function(){
//                            $(this).find('.controller_raid_selection option:selected').each(function(){
//                                if($(this).val()){
//                                    tempQty = parseInt(tempQty) + 1
//                                }
//                            })
//                            $(this).find('.storage_controller option:selected').each(function(){
//                                if($(this).val()){
//                                    tempQty = parseInt(tempQty) + 1
//                                }
//                            })
//                        })
                        params.selected_attribute_qty = tempQty
                        params.child_gqt_vals = JSON.stringify(tempArrayCompQty)
                        params.child_gqt_acc_vals = JSON.stringify(tempArrayAccQty)
                        $('input#selected_attribute_qty').val(tempQty);
                    }
                    //
                    var supercapArr = this._getSupercap();
                    if (supercapArr) {
                        params.supercap_data = JSON.stringify(supercapArr);
                    }
                }
                var resData;
                attrib && ($(form).find('input[name="attrib_val"]').length) && $.ajax({
                      url:'/product-configure/attribute-value-save',
                      type: 'POST',
                      data: params,
                      async: false,
                      success: function(data){
                          /* validation for global qty for trigger or error message modal pop up*/
                          if ((JSON.parse(data).data)){
                              $('#main_form').empty()
                              $('.main_form_mobile').empty()
                              $("s.cus_theme_loader_layout_config").addClass("d-none");
                          }
                          else {
                               resData = data
                               test_return = 0;
                          }
                      },
                      error: function(data) {
                         test_return = 0;
                         console.log('An error occurred.');
                         $(current_attrib).next('li').click()
                           $(".cus_theme_loader_layout_config").addClass("d-none");
                           $(".attribute_select").removeClass("loader");
                      },
                });
                return {'res': test_return, 'data': resData}
            }
        },

        // If not form then render form and if form then call form submit event for store and render from for the element whcich click
        _onAttributeChange : async function(ev) {
            ev.preventDefault();
            var currentTarget = $(ev.currentTarget)
            // Supercap Accessory missing error
            var showSupercapWarning = false
            $('div.component_configs').not('.d-none').find('input.is_supercap').each(function (){
                if(this.checked && !$(this).siblings('.supercap_accessory_div').find('.controller_supercap_acc option:selected').val()){
                    showSupercapWarning = true
                    return;
                }
            })
            if(showSupercapWarning){
                var dialog = new Dialog(this, {
                   size: 'medium',
                   title: 'Warning',
                   $content:_t("<p class='ml-0'>Selection of Supercap accessory is required if the controller's Supercap checkbox is checked.</p>"),
                })
                dialog.open()
                return;
            }
            //
            if($('.cfg_step_header').find('.max_warning').length > 0){
                $('.max_warning').removeClass('error_max_val')
            }
            var form = $('.div_main_form')
            if ($(form).length > 0){
                var is_valid = this._validateCurrentNode()
                if (!is_valid){
                if($('.cfg_step_header').find('.max_warning').length > 0){
                    $('.cfg_step_header').find('.max_warning').addClass('alert alert-warning').removeClass('alert-primary')
                }
                return false
                }
            }

            var flag_error = 1;
           /* ToDo: accessory required process */
//            var attrib = $(form).find("input[name='attribute_line_id']").val()
            var attrib = $('li.attribute_select.active').attr('attribute_line_id')
            var selected_accessory = [];
            var attrib_val = [];
            var check_selected_accessory = 0;
            var check_accessory = false

            attrib && $("input[name='attrib_val']:checked").each(function(){
                if ($(this).attr('dependent-required-component')) {
                    attrib_val.push(($(this).val()));
                    check_accessory = true;
                    var accessories = $(this).parents('.attrib_label').siblings('.component_accessories').find('.js_accessories_input:checked').filter(function() {
                        return !$(this).parents('.component_accessories').hasClass('d-none')
                    });
                    accessories.each(function(){
                        selected_accessory.push($(this).val());
                    });
                }
            });

            var accessories_data = {'selected_accessory': selected_accessory, 'line': attrib, 'attrib_val': attrib_val}
            check_accessory && await ajax.jsonRpc('/verify_required_dynamic_accessory','call', accessories_data).then(function(data) {
                 if(data.error){
                    var dialog = new Dialog(this, {
						   size: 'medium',
						   title: 'Alert',
						   $content:_t(data.error),
					   })
					   dialog.open()
					   $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
					   flag_error = 0;
                 }
            });

            /* Limitation Error Message */

            if (flag_error) {
                /*get data */
                var attrib = $(form).find("input[name='attribute_line_id']").val()
                var req = $(form).find("input[name='is_required']").val()
                var current_attrib = $("ul").find("[attribute_line_id='" + attrib + "']");
                var test_return = 1;
                var params = {}
                var params = $(form).serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
                var selected_attrib_data = {}
                $("input[name='attrib_val']:checked").each(function(){
                    var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
//                    if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                        if($(this).val() in selected_attrib_data){
                            selected_attrib_data[$(this).val()] += selQty
                        } else {
                            selected_attrib_data[$(this).val()] = selQty
                        }
//                    }
                });
                params.selected_attrib_val = JSON.stringify(selected_attrib_data)
                params.parent_step_id = $('li.attribute_select.active').attr('attribute_id')
                if (attrib && ($(form).find('input[name="attrib_val"]:checked').length)) {
                    await ajax.jsonRpc('/verify_session_limitations','call', params).then(function(data) {
                        if (data.error){
                            var dialog = new Dialog(this, {
                                   size: 'medium',
                                   title: 'Alert',
                                   $content:_t(data.error),
                               })
                               dialog.open()
                               $(".cus_theme_loader_layout_config").addClass("d-none");
                                $(".attribute_select").removeClass("loader");
                            flag_error = 0;
                    }
                });
                }
            }

            if (flag_error) {
                var res_data = this._onSubmitForm($(form));
                if(res_data.res) {
                    $('#node-accordion .nav-pills').find('.nav-item').removeClass('active');
                    var attribute_line_id = currentTarget.attr('attribute_line_id')
                    var current_attrib = $("ul").find("[attribute_line_id='" + attribute_line_id + "']");
                    current_attrib.addClass('active');
                    this._attr_change_block(currentTarget, $(form))
                } else {
                    var data = JSON.parse(res_data.data)
                    if(data.child_step_warning){
                        if(data.child_acc_gqt_warning){
                            var message = "<div><p> You have reached the maximum number of accessories allowed.</p> <p> You can only add a total of <b>" + data.max_allowed_qty + "</b> accessories From <b>" + data.step_name + "</b>.</p></div>"
                        } else {
                            var message = "<div><p> You have reached the maximum number of components allowed.</p> <p> You can only add a total of <b>" + data.max_allowed_qty + "</b> components From <b>" + data.step_name + "</b>.</p></div>"
                        }
                        var dialog = new Dialog(this, {
                           size: 'medium',
                           title: 'Warning',
                           $content: _t(message)
//                           $content:_t("<p class='pt-3 pb-3'>You have reached the maximum number of components allowed.</p><ul class='mr-3 mb-0'> <li class='pb-3'>In <span>" + data.step_name + "</span>, You can only add a total of <span>" + data.max_allowed_qty + "</span> components.</li></ul><p class='pb-3'>Click the Reset Step, next to the Search box, to start over.</p>")
//                           $content:_t("<p class='ml-0'>Maximum number of add-on controllers has been reached for the <b>" + data.step_name + "</b> step. QTY: " + data.max_allowed_qty + "</p>"),
                        })
                        dialog.open()
                        $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                    } else {
                        $("#error-save-session").modal({keyboard: true});
                        $("#error-save-session .error-save-session-msg").html();
                        $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                    }
                }
            }
        },

        // Inner method which display form after pervious element submit event
        _attr_change_block: function(currentTarget, form){
            var self = this;
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
//            $('.mark-done').addClass('d-none')
            $('.mark-done.readonly_step').removeClass('d-none');
            $('.attribute_select').removeClass('restricted')
            $('.attribute_select').find('.mark-done').addClass('d-none')
            $('.restricted').find('.mark-done').removeClass('d-none')
            $('.main_form_mobile').empty()
            var current_session_id =  $('.node .active-node').attr('data-session-id')
            var attribute_line_id = currentTarget.attr('attribute_line_id')
            var attribute_line_desc = currentTarget.attr('data_attribute_line_desc')
            var mobile_form_div = currentTarget.next('.main_form_mobile')
            var raidSetup = 0;
            if(currentTarget.attr('id') == 'raid_setup_block'){
                raidSetup = 1;
            }
            ajax.jsonRpc('/product-configure/attribute-change','call',{'current_session_id':current_session_id,'attribute_line_id':attribute_line_id, 'is_raid': raidSetup}).then(function(data) {
                 if(data){
                    // todo : $(ev.currentTarget).hasClass("restricted")
                    if ($(window).width() > 767){
                        $('#main_form').html(data.render_form)
                        /** Set max height of the form */
                        var attr_height = $('.total-attr-height').height() - 50
                        //$('.div_main_form, .js-set-height').css('max-height', attr_height)
                    } else {
                        $(mobile_form_div).html(data.render_form)
                    }
                    var divHeight = $('.total-attr-height').height() - 171;
                    if($('form.div_main_form').height() > 550){
                        $('form.div_main_form').css('max-height', divHeight + 'px');
                    }else{
                        $('form.div_main_form').css('max-height', '550px');
                    }
                    var price = 0.0
                    var total_price = 0.0
                    var set_aprice = 0.0
                    var set_aprice_total = 0.0
                    var qty = 1
                    if($('input[name="is_sub_steps"]').length){
                        $('.div_main_form').css('margin-bottom', '46px');
                        $('.drive_types').each(function(){
                            self._manageCompVisibility($(this));
                        })
                    }
//                    var checked_element = $('.div_main_form').find(".config_attr_value:checked").filter(function() {
//                        return !$(this).parents('.info_config_attr_value_radio').hasClass('d-none')
//                    });
                    if(currentTarget.attr('id') == 'raid_setup_block'){
                        self._verifyAddVisibilityOnStepChange();
                    }
                    var checked_element = $('.div_main_form').find(".config_attr_value:checked")
                    if(checked_element.length)
                    {
                        $(checked_element).each(function(){
                            if($(this).parents('.component_configs').find('.drive_types option:selected').val() == $(this).attr('drive-id')){
                                $(this).parents('div.info_config_attr_value_radio').removeClass('d-none');
                            }

//                            total_price = $(this).attr('is-config-item-only') ? 0 : parseFloat($(this).parent().find('.prod_sale_price').html().replace(/,/g, ''));
//                            price = $(this).attr('is-config-item-only') ? 0 : parseFloat($(this).parent().find('.oe_currency_value').html().replace(/,/g, ''));
                            total_price = parseFloat($(this).parent().find('.prod_sale_price').html().replace(/,/g, ''));
                            price = parseFloat($(this).parent().find('.oe_currency_value').html().replace(/,/g, ''))
                            if(!total_price && price){
                                total_price = price
                            } else if(!price && total_price) {
                                price = total_price
                            }
                            qty = $(this).parents('div.info_config_attr_value_radio').find($("select[name='line_qty_"+$(this).val()+"']")).val();
                            var set_elment = $(this);
                            if($(this).attr('type') == 'radio')
                            {
                                set_elment = $('.div_main_form').find(".config_attr_value");
                            }
                            var is_same = $('.node_configure').attr('same_configure_node')
                            var node = 1;
                            if(is_same=="1")
                            {
                            	node = parseInt($('.node_configure').attr('total-node-count'))
                            }
                            set_aprice_total = self._calc_accessories_total_price($(this),node,qty)
                            set_aprice = self._calc_accessories_price($(this),node,qty)
                            if(!set_aprice_total && set_aprice){
                                set_aprice_total = set_aprice
                            } else if(!set_aprice && set_aprice_total) {
                                set_aprice = set_aprice_total
                            }
                            var get_node_qty = self._calc_accessories_node_qty($(this),node,qty)
                            set_elment.attr('data-price',price)
                            set_elment.attr('data-total-price',total_price)
                            set_elment.attr('data-qty',qty)
                            set_elment.attr('data-aprice',set_aprice)
                            set_elment.attr('data-aprice-total', set_aprice_total)
                        });
                        if($('input[name="is_sub_steps"]').length){
                            $('input.config_attr_value:checked').each(function (){
//                                if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                                    $(this).parents('.component_configs').removeClass('d-none');
                                    var controllerType = $(this).parents('.component_configs').find('select.controller_raid_selection option:selected').attr('type')
                                    if(controllerType == 'supercap'){
                                        $(this).parents('.component_configs').find('.supercap-controller').removeClass('d-none');
                                    }
//                                }
                            });
                            self._manageSelControllerVisibility();
                        }
                    }
                    else
                    {
                        var saved_price = (parseFloat(data.total_price) - parseFloat(data.price)).toFixed(2)
                        $('.div_main_form').find(".config_attr_value").attr('data-price',price).attr('data-qty',qty).attr('data-aprice',set_aprice).attr('data-total-price', total_price)
                        $('.subtotal_price').find('.oe_currency_value').html((data.price).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                        $('.subtotal_price').find('.session_total_price').html((data.total_price).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                        $('.session_saved_price').find('.oe_currency_value').html((saved_price).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                        if(parseFloat(saved_price) <= 0){
                            $('.you_save_block').addClass('d-none');
                        }
//                        else{
//                            $('.you_save_block').removeClass('d-none');
//                        }
                    }
                    $('.attr_description').html($('.main_attrb_info').html())
                    self._showMoreLess();
                    $('.subtotal_price .session_price').attr('session_price',data.price)
                    if(data.attribute_set.length){
                        $.each(data.attribute_set, function(key,value) {
                            var ele = $("ul").find("[attribute_id='" + value + "']");
                            ele.find('.mark-done').removeClass('d-none')
                            $('.restricted').find('.mark-done').removeClass('d-none')

                            // New changes related to '*' symbol visibility
                            var requiredAnotherSteps = JSON.parse(ele.attr('data-required-another-steps') || '[]')
                            var dynamicAnotherSteps = JSON.parse(ele.attr('data-dynamic-another-steps') || '[]')
                            $('li.attribute_container.attribute_select').each(function(){
                                if (requiredAnotherSteps.includes(parseInt($(this).attr('data-required-step'))) && !$(this).find('.lead').length) {
                                    $(this).find('.attr-name').append('<span class="lead lead-required-step">*</span>');
                                }
                                if (dynamicAnotherSteps.includes(parseInt($(this).attr('data-required-step'))) && $(this).find('.lead').length && $(this).find('.mark-done').hasClass('d-none')) {
                                    // If required and Not yet selected
                                    $(this).find('.attr-name span.lead').remove();
                                }
                            });
                        });
                    }
                    else{
                        // Remove You Save
                        $('.you_save_block').addClass('d-none');
                        // Reset step
                        $('li.attribute_container.attribute_select').each(function(){
                            if($(this).attr('data-dynamic-another-steps')){
                                !$(this).find('.lead').length && $(this).find('.attr-name').append('<span class="lead lead-required-step">*</span>');
                            }
                        });
//                        $.each(dynamicAnotherSteps, function() {
//                            var ele = $("ul").find("[attribute_id='" + this + "']");
//                            !ele.find('.lead').length && ele.find('.attr-name').append('<span class="lead lead-required-step">*</span>');
//                        });
                    }
                    $.each(data.attribute_set, function(key,value) {
                      var ele = $("ul").find("[attribute_id='" + value + "']");
                      ele.find('.mark-done').removeClass('d-none')
                      $('.restricted').find('.mark-done').removeClass('d-none')
                    });


                    // Load add on controllers from session
                    if((data.add_on_attrs && data.add_on_attrs.length) && $('input[name="is_sub_steps"]').length){
                        var params = {'config_session': $('#current_config_session').val(), 'parent_step_id': $('li.attribute_select.active').attr('attribute_id')}
                        var addOnAttributes = data.add_on_attrs
                        addOnAttributes.forEach(function(value) {
                            params.controller_comp_id = value
                            params.current_active_step_line = $('li.attribute_select.active').attr('attribute_line_id')
                            ajax.jsonRpc('/product-configure/add-add-on-controller','call',params).then(function(data) {
                                if(data){
                                    $('.selected_controller_step:last').after(data.render_form);
                                    $('.drive_types').each(function(){
                                        self._manageCompVisibility($(this));
                                    })
                                    if($('input[name="check_global_qty"]').val()){
                                        var tempQty = 0
                                        $('input.config_attr_value:checked').each(function (){
//                                            if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                                                var selQty = parseInt($(this).siblings('div').find('.line_qty_box option:selected').val() || '0')
                                                tempQty = tempQty + selQty
//                                            }
                                        })
                                        $('.component_configs.add-on').each(function(){
                                            $(this).parents('.component_configs').css("pointer-events", "none");
                                            $(this).parents('.component_configs').find('.remove_storage_controllers').css('pointer-events', 'auto');
                                            $(this).parents('.component_configs').find('.search_component').css('pointer-events', 'auto');
//                                            $(this).find('.controller_raid_selection option:selected').each(function(){
//                                                if($(this).val()){
//                                                    tempQty = parseInt(tempQty) + 1
//                                                }
//                                            })
//                                            $(this).find('.storage_controller option:selected').each(function(){
//                                                if($(this).val()){
//                                                    tempQty = parseInt(tempQty) + 1
//                                                }
//                                            })
                                        })
                                        $('input#selected_attribute_qty').val(tempQty);
                                    }
                                    self._manageSelControllerVisibility();
                                }
                            });
                        });
                    }
                }
                var current_session_input = $('#current_session_input').val() ? JSON.parse($('#current_session_input').val()) : []
                $.each(current_session_input, function (i, val) {
                    $('.attribute_select[attribute_id=' + val + ']').addClass('restricted')
                    $('.restricted').find('.mark-done').removeClass('d-none')
                });
                var session_required_input = $('#session_required_input').val() ? JSON.parse($('#session_required_input').val()) : []
                $.each(session_required_input, function (i, val) {
                    if (!$('.attribute_select[attribute_id=' + val + ']').find('.lead').length) {
                        $('.attribute_select[attribute_id=' + val + ']').find('.attr-name').append('<span class="lead lead-required-step">*</span>');
                    }
                });
                var isNegative = $('div.you_save_block .oe_currency_value').text().includes('-')
                if(parseFloat($('div.you_save_block .oe_currency_value').text()) <= 0 || isNegative){
                    $(".you_save_block").addClass("d-none");
                } else {
                    if($('div.session_config_nodes .mark-done:not(.d-none)').length){
                        $(".you_save_block").removeClass("d-none");
                    }
                }
                $(".cus_theme_loader_layout_config").addClass("d-none");
                $(".attribute_select").removeClass("loader");
            });
        },

        // for next node create or set session and load form for that session
        _onnextnodeClick: function(ev) {
            ev.preventDefault();
            $(".cus_theme_loader_layout_config").removeClass("d-none");
            $(".attribute_select").addClass("loader");
             var current_node = $(".active-node").attr('data-node')
             var session_master_id = $(".active-node").attr('data-session-master')
             var total_node= parseInt($(".active-node").attr('total-node'))
             var node_count =parseInt(current_node)+1
             if(node_count == total_node) {
                $('.total-node-selection .next-node').addClass('d-none')
             } else {
                $('.total-node-selection .next-node').removeClass('d-none')
             }
             if(node_count > 1) {
                $('.total-node-selection .perv-node').removeClass('d-none')
             } else {
                $('.total-node-selection .perv-node').addClass('d-none')
             }
             if(node_count > total_node) {
                $(".cus_theme_loader_layout_config").addClass("d-none");
                $(".attribute_select").removeClass("loader");
                return
             }
             ajax.jsonRpc('/product-configure/set-update-session-node', 'call', {'session_master_id':session_master_id, 'node':node_count}).then(function(data) {
                if(!data.session_id)
                  console.log("we are unable to create node")
                $(".active-node").html("Node "+node_count)
                $("#current_config_session").val(data.session_id)
                $('.node .active-node').attr('data-session-id',data.session_id)
                $('.node .active-node').attr('data-node',node_count)
                $(".attribute_select").first().trigger('click')
              })
        },

        // for previous node create or set session and load form for that session
         _onpervnodeClick: function(ev) {
             $(".cus_theme_loader_layout_config").removeClass("d-none");
             $(".attribute_select").addClass("loader");
             var current_node = $(".active-node").attr('data-node')
             var total_node= parseInt($(".active-node").attr('total-node'))
             var session_master_id = $(".active-node").attr('data-session-master')
             var node_count =parseInt(current_node)-1
             if(node_count == total_node) {
                $('.total-node-selection .next-node').addClass('d-none')
             } else {
                $('.total-node-selection .next-node').removeClass('d-none')
             }
             if(node_count > 1) {
                $('.total-node-selection .perv-node').removeClass('d-none')
             } else {
                $('.total-node-selection .perv-node').addClass('d-none')
             }
             if(node_count < 1)
             {
                $(".cus_theme_loader_layout_config").addClass("d-none");
                $(".attribute_select").removeClass("loader");
                return
             }

             ajax.jsonRpc('/product-configure/set-update-session-node', 'call', {'session_master_id':session_master_id, 'node':node_count}).then(function(data) {
                if(!data.session_id)
                    console.log("we are unable to create node")
                $(".active-node").html("Node "+node_count)
                $('.node .active-node').attr('data-session-id',data.session_id)
                $('.node .active-node').attr('data-node',node_count)
                $(".attribute_select").first().trigger('click')
            })
        },

        // main session name chane
        _changeSessionName: function(ev) {
        	var name = $(ev.currentTarget).siblings('input[name="name"]').val();
        	$("#configure-save-session").find(".form-control").removeClass('is-invalid')
			$('#configure-save-session').find(".form_error").remove()
        	if($.trim(name).length == 0){
		 	    $(ev.currentTarget).siblings('input[name="name"]').after(_t('<div class="form_error">Required field</div>'));
                $(ev.currentTarget).siblings('input[name="name"]').addClass('is-invalid')
                return false
            }
            var session_id = $(ev.currentTarget).siblings('input[name="sessionid"]').val();
            ajax.jsonRpc('/product-configure/session-name-update-json', 'call', {'name':name, 'session_id':session_id }).then(function(data) {
                $(".js_edit_from").addClass("d-none")
                $(".js_name_block").html(data.set_name)
                $('#configure-save-session').find('.close').click()
                $(".js_name_block").removeClass("d-none")
                $(".js_edit").removeClass("d-none")
                $(".cus_theme_loader_layout_config").addClass("d-none");
                $(".attribute_select").removeClass("loader");
            })
        },

        // Open up popup for save current session
        _onClickSaveConfigure: function(ev) {
            $("#configure-save-session").modal({
                keyboard: true,
            });
        },

        // Open up popup for load current session
        _onClickLoadConfigure: function(ev) {
            $("#configure-load-session").modal({
                keyboard: true,
            });
        },

        // Open up popup for load current session
        _onClickRequestQuote: function(ev) {
		$(".attribute_select").addClass("loader");
            var session_master_id = $(ev.currentTarget).attr('data-id')
            $('#configure-request-quote').find('.thank-you-note').hide()
            $('#configure-request-quote').find('.lead_create_form').show()
            var data_type = $(ev.currentTarget).attr('data-type');
			$('.lead_create_form').find("textarea[name='question']").val('')
			if(data_type === "ask-question"){
				$(".cus_theme_loader_layout_config").addClass("d-none")
					$("#configure-request-quote").modal({
					keyboard: true,
				});
                $("#configure-request-quote").find(".form-control").removeClass('is-invalid')
				$('#configure-request-quote').find('.session-heading').html(' Ask a Question')
				$('.lead_create_form').find("input[name='type']").val("Question For : ")
				$('.lead_create_form').find("textarea[name='question']").attr('rows',1)
				$('.lead_create_form').find("textarea[name='question']").attr('placeholder','Please Ask questions')
				$('#configure-request-quote').find('.quote-note').addClass('d-none');
				$('#configure-request-quote').find('.quote-btn-send-request').addClass('d-none');
				$('#configure-request-quote').find('.form_note').addClass('d-none');
				$('#configure-request-quote').find('.'+data_type).removeClass('d-none');
				if(session_master_id) {
					$('.cus_theme_loader_layout').removeClass('d-none');
					ajax.jsonRpc('/product-configure/request-quote', 'call', {'session_master_id':session_master_id}).then(function(data) {
						$('.cus_theme_loader_layout').addClass('d-none')
						$("#configure-request-quote").find(".form-control").removeClass('is-invalid')
						$('.lead_create_form').find(".form_error").remove()
						$('#configure-request-quote #node-request-quote').html(data)
					})
				}
			}
            else{
				ajax.jsonRpc('/product-configure/is-validate-session-master','call',{'session_master_id':session_master_id}).then(function(data) {
					 if(data){
					 			$(".cus_theme_loader_layout_config").addClass("d-none")
									$("#configure-request-quote").modal({
									keyboard: true,
								});
								$('#configure-request-quote').find('.session-heading').html(' Request a Quote')
								$('.lead_create_form').find("input[name='type']").val("Request For Quote : ")
								$('.lead_create_form').find("textarea[name='question']").attr('rows',3)
								$('.lead_create_form').find("textarea[name='question']").attr('placeholder','Please add your system configure or questions')
								$('#configure-request-quote').find('.quote-note').addClass('d-none');
                                $('#configure-request-quote').find('.quote-btn-send-request').addClass('d-none');
                				$('#configure-request-quote').find('.form_note').addClass('d-none');
								$('#configure-request-quote').find('.'+data_type).removeClass('d-none');
								if(session_master_id) {
									$('.cus_theme_loader_layout').removeClass('d-none');
									ajax.jsonRpc('/product-configure/request-quote', 'call', {'session_master_id':session_master_id}).then(function(data) {
										$('.cus_theme_loader_layout').addClass('d-none')
                    					$("#configure-request-quote").find(".form-control").removeClass('is-invalid')
                    					$('.lead_create_form').find(".form_error").remove()
										$('#configure-request-quote #node-request-quote').html(data)
									})
								}
					 }
					 else{
						var dialog = new Dialog(this, {
						   size: 'medium',
						   title: 'Configuration Check',
						   $content:_t("<p class='ml-0'>A required component is not selected, please make a selection before requesting a quote.</p>"),
					   })
					   dialog.open()
					   $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
					 }
				});
           }

            $(".cus_theme_loader_layout_config").addClass("d-none");
            $(".attribute_select").removeClass("loader");
        },

		validate_form: function(form) {
			$('.lead_create_form').find(".form_error").remove()
            $(form).find(".form-control").removeClass('is-invalid')
			var email = $(form).find("input[name='email']")
			var question = $(form).find("textarea[name='question']")
            var name = $(form).find("input[name='name']")
            var isFormValid = true;
			if($.trim(email.val()).length == 0){
                isFormValid = false;
		 	    $(form).find("input[name='email']").after(_t('<div class="form_error">Required field</div>'));
                $(form).find("input[name='email']").addClass('is-invalid')
            }
            //regular expression validation for the email
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            if (! emailReg.test($.trim(email.val()))){
                isFormValid = false;
                email.addClass('is-invalid');
                $(form).find("input[name='email']").after(_t('<div class="form_error">Enter a valid email</div>'));
            }
    		if($.trim(question.val()).length == 0){
                isFormValid = false;
    			question.after(_t('<div class="form_error">Required field</div>'));
                question.addClass('is-invalid')
    		}
            if($.trim(name.val()).length == 0){
                isFormValid = false;
                name.after(_t('<div class="form_error">Required field</div>'));
                name.addClass('is-invalid')
            }
            if(isFormValid) {
                return true
            } else {
                return false
            }
		},


        // Open up popup for load current session
        _onClickRequestSend: function(ev) {
            var form = $('.lead_create_form')

            var is_valid = this.validate_form(form)
            if(!is_valid){
            	return false
            }
            var session_master_id = $(ev.currentTarget).attr('data-id');
             $.ajax({
                  url:'/submit-form-create-lead',
                  type: 'POST',
                  data: $(form).serialize(),
                  async: false,
                  success: function(data){
                  	$('#configure-request-quote').find('.lead_create_form').hide()
					$('#configure-request-quote').find('.thank-you-note').show()
					setTimeout(function(){
						$('#configure-request-quote .close').click()
					 }, 2000);
                  return true
                  },
                  error: function(data) {
                     console.log('An error occurred.');
                     $(current_attrib).next('li').click()
                       $(".cus_theme_loader_layout_config").addClass("d-none");
                        $(".attribute_select").removeClass("loader");
                  },
            });

        },

        // Open up popup for email
        _onClickEmailConfigure: function(ev) {
            $("#configure-email-session").modal({
                keyboard: true,
            });
            $('#configure-email-session').on('show.bs.modal', function () {
                $('input.session-new-name').val('')
            })
        },

        // Send an email for product configurator
        _sendEmail: function(ev) {
            var session_id = $(ev.currentTarget).siblings('#session-id').val();
            var email = $(ev.currentTarget).siblings('.session-new-name').val();
            var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(regex.test(email)) {
                    $('.cus_theme_loader_layout').removeClass('d-none')
                    $(ev.currentTarget).siblings('.session-new-name').removeClass('is-invalid')
                    ajax.jsonRpc('/product-configure/send-email', 'call', {'session_id':session_id, 'email': email }).then(function(data) {
                        $('.cus_theme_loader_layout').addClass('d-none')
                        $('.success-msg').removeClass('d-none')
                        setTimeout(function(){
                            $('.success-msg').removeClass('d-none').addClass('d-none')
                            $("#configure-email-session").modal('hide')
                        }, 1500);
                    })
                }
                else{
                    $(ev.currentTarget).siblings('.session-new-name').removeClass('is-invalid').addClass('is-invalid')
            	}
        },

        // accordion at least one open
        _onClickCollapse: function(e) {
            if($(e.currentTarget).parents('.accordion').find('.collapse.show')){
                var idx = $(e.currentTarget).index('[data-toggle="collapse"]');
                if (idx == $('.collapse.show').index('.collapse')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

       _onnjseditClick: function(ev) {
            $(".js_edit_from").removeClass("d-none")
            $(".js_name_block").addClass("d-none")
            $(".js_edit").addClass("d-none")
        },

        // Toggle div for extra button for a responsive view
       _onClickExtraButton: function(ev) {
            $(".extra_buttons").toggleClass('d-none');
            $(".extra_buttons").toggleClass("extra_buttons_active");
            if($(".extra_buttons").hasClass("extra_buttons_active")) {
                $('body').css("overflow", "hidden");
            } else {
                $('body').css("overflow", "auto");
            }
        },

        // Toggle Show/less for description
        _showMoreLess: function(ev) {
            var content_height = $(".attr_description .attr_description_data").length > 0 ? $(".attr_description .attr_description_data")[0].scrollHeight  : 0;
            if(content_height > 104) {
                $('.attr_description').find('.categ_read.show_less').addClass('d-none');
                $(".show_more").click(function(ev){
                    ev.preventDefault();
                    $('.attr_description').find('.categ_read.show_more').addClass('d-none');
                    $('.attr_description').find('.categ_read.show_less').removeClass('d-none');
                    $(".attr_description .attr_description_data").animate({'height' : content_height+'px'},"slow");
                })
                $(".show_less").click(function(ev){
                    ev.preventDefault();
                    $('.attr_description').find('.categ_read.show_more').removeClass('d-none');
                    $('.attr_description').find('.categ_read.show_less').addClass('d-none');
                    $(".attr_description .attr_description_data").animate({'height': '100px'},"slow");
                });
            } else {
                $('.attr_description').find('.categ_read.show_less, .categ_read.show_more').addClass('d-none');
            }
        },

        // Changes the selection Qty to first Qty
        _changeSelectionQty: function(ev) {
            if ($(ev.currentTarget).is(':checked')) {
                var option = $($(ev.currentTarget).parents('.attrib_label').find('.line_qty_box')).find('option')[1]
                if ($(option).length && $($(ev.currentTarget).parents('.attrib_label').find('.line_qty_box')).find('option:selected').val() == '0') {
                    $(option).attr('selected', true);
                }
            }
        },

       _onClickPreconfigButton: async function(ev){
            var sessionMaster = $('.multi-config-server').attr('session_master_id')
            await ajax.jsonRpc('/product-configure/reset-session','call',{
                'session_master_id': sessionMaster,
                'product_id': $(ev.currentTarget).attr('product-id')
            }).then(function(data) {
                var url = $(ev.currentTarget).attr('preconfig-url')
                window.location.href = url;
            });
       },
        _manageSelControllerVisibility: function(){
            var allSelControllers = []
            var controllerDiv = $('div#sel_controller_tabs')
            $('input.config_attr_value:checked').each(function (){
//                if(!$(this).parents('.info_config_attr_value_radio.d-none').length){
                    $(this).parents('.div_category').find('.attr_category').removeClass('d-none')
                    $(this).attr('controller-name') && allSelControllers.push($(this).attr('controller-name'))
//                }
            });
            var uniqueControllersSet = new Set(allSelControllers)
            var uniqueControllersArray = Array.from(uniqueControllersSet);
            if(uniqueControllersArray){
                controllerDiv.empty();
            }
            uniqueControllersArray.forEach(function(value) {
                controllerDiv.append('<span class="mr-2 p-2" style="border: 2px solid #eee; border-radius: 5px;"><span class="controller-tag-name">' + value +
                '</span> <span class="controller-close-btn" style="font-size: 1rem;font-weight: bold;color: #000;cursor: pointer;"> &times; </span></span>');
            });
        },
        _manageCompVisibility: function(selDriveDiv){
            if(parseInt(selDriveDiv.val())){
                selDriveDiv.parents('.component_configs').find('input.config_attr_value').each(function(value){
                    if($(this).attr('drive-id') == selDriveDiv.val()){
                        $(this).parents('div.info_config_attr_value_radio').removeClass('d-none')
                        $(this).parents('.main_component').find('.js_div_category[data-categ="categ_'+$(this).attr('data-attrb_id')+'"]').removeClass('d-none')
                    } else {
                        $(this).parents('div.info_config_attr_value_radio').addClass('d-none')
                        $(this).parents('.main_component').find('.js_div_category[data-categ="categ_'+$(this).attr('data-attrb_id')+'"]').addClass('d-none')
                    }
                })
                selDriveDiv.parents('.component_configs').find('input.search_component').removeClass('d-none')
            } else {
                selDriveDiv.parents('.component_configs').find('div.info_config_attr_value_radio').addClass('d-none')
                selDriveDiv.parents('.component_configs').find('input.search_component').addClass('d-none')
                selDriveDiv.parents('.component_configs').find('.js_div_category').addClass('d-none')
            }
        },

        _onChangeRaidTotalQty: function(ev) {
            var raidDiv = $(ev.currentTarget).parents('.raid_table_row')
            raidDiv.find('select[name="raid_levels"]').val('')
            raidDiv.find('select[name="raid_qty"]').val('')
            raidDiv.find('select[name="hot_spares"]').val('')
        },

        _onChangeControllerSupercapAcc: function(ev) {
            $(ev.currentTarget).val() && $('#you_save_price_warning_div').removeClass('d-none')
        },

        _onKeyupComponentSearch : function(ev) {
			var key = $(ev.currentTarget).val().toUpperCase()
			$(ev.currentTarget).parents('.component_configs').find('.attrib_label').each(function(){
            if ($(this).text().toUpperCase().indexOf(key) > -1 && (!$(this).hasClass("d-none")))  {
					  $(this).show();
				 } else {
					  $(this).hide();
				 }
        	});
        },
    });
});