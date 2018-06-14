// Here You can type your custom JavaScript...
jQuery('.tabs--trigger-contents')[0].click(function(){
    jQuery('.facet-checkbox--input')[0].click(function(){
    	//by example only the first facet selected. you will have to modify that to accomodate different facets
    		console.error("facet style id is" + gap.viewModel.styleFacet.k_selected());
            sendToProductsService(gap.viewModel.styleFacet.k_selected(), "style")
    });
});

function sendToProductsService(key, facetName){
    var facet_id=""
    if(facetName == "style"){
        facet_id = gap.viewModel.styleFacet.k_selected()
    }
    jQuery.ajax({
    contentType: 'application/json',
    data: JSON.stringify(gap.viewModel.productCategory.k_products()),
    dataType: 'json',
    success: function(data){
        console.warn("device control succeeded");
    },
    error: function(){
        console.warn("Device control failed");
    },
    processData: false,
    type: 'POST',
    url: '/test/control'
});
}



