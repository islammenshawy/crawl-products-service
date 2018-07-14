// Here You can type your custom JavaScript...
categoryProducts = {};
finalResultData = {};
productsData ={};
handledCats = {};
clickPromises = [];
jQuery('.tabs--object-facet-style .tabs--trigger-contents')[0].click(function(){
    function getCurrentFilterKey(styleKey){
        var filter_name = jQuery('.facet-checkbox--input').filter(function(){return this.value == styleKey}).siblings()[0].innerHTML.replace(/ /g,"_");
        return "cat_facet_catg_" + filter_name;
    }
    function runPromiseInSequence(arr, input) {
      return arr.reduce(
        (promiseChain, currentFunction) => promiseChain.then(currentFunction),
        Promise.resolve(input)
      );
    }
    function p1(elm) {
       return new Promise((resolve, reject) => {
           if(jQuery('.accordion--content--inner:visible').length === 0){
                    jQuery('.tabs--object-facet-style .tabs--trigger-contents')[0].click();
            }
            optimizely.get('utils').waitUntil(function(){
                    return listIsAvailable('.tabs--facets .tabs--facet-style input[class="facet-checkbox--input"]');
                }).then(function(){
                    loadClickPromises();
                }).then(function() {
                    return resolve(jQuery(elm).click());
           });
        
      });
    }
    function p2(elm) {
      return new Promise((resolve, reject) => {
        //resolve(jQuery(elm));
        setTimeout(function(data){
            if(!handledCats[elm[0].value] ){
                handledCats[elm[0].value] = elm[0].value;
                if(jQuery('.accordion--content--inner:visible').length === 0){
                    jQuery('.tabs--object-facet-style .tabs--trigger-contents')[0].click();
                }
                optimizely.get('utils').waitUntil(function(){
                    return listIsAvailable('.tabs--facets .tabs--facet-style input[class="facet-checkbox--input"]');
                }).then(function(){
                    loadClickPromises();
                }).then(function(){
                    var filterKey=getCurrentFilterKey(elm[0].value);
                    var mergedProduct = [].concat.apply([],(gap.viewModel.productCategory.k_products().map(a => a.products))).map(a => { a['category_filter'] = filterKey; return a;})
                    categoryProducts[filterKey] = mergedProduct;
                    console.log("Number of products is " + mergedProduct.length + ", for filter " + filterKey);
                    return resolve(elm);
            })}
        }, 8000)
      });
    }
    function p3(elm) {
      return new Promise((resolve, reject) => {
         return resolve(jQuery(elm).click());
      });
    }
    function p4(elm) {
      return new Promise((resolve, reject) => {
        //resolve(jQuery(elm));
        // ps.subscribe('categoryData:ready', function(data){
        //     return resolve(elm);
        // })
        setTimeout(function() {
            return resolve(elm);
        }, 5000);
      });
    }
    function f3(elm) {
      return new Promise((resolve, reject) => {
        resolve(jQuery('.tabs--clear-all-button').click());
      });
    }
    function processProductsArray(products){
        var index = 0;
        var array = [].concat.apply([],Object.values(products))

        function next() {
            if (index < array.length) {
                parseEachProd(array[index++]).then(next);
            }
            //Last filter then process the products
            else if(index == array.length){
                sendToProductsService();
            }
        }
        next();
    }
    function processArray(fn) {
        var index = 0;
        const promiseArr = [p1, p2, p3, p4, f3];

        function next() {
            if (index < clickPromises.length) {
                fn(promiseArr, clickPromises[index++]).then(next);
            }
            //Last filter then process the products
            else if(index == clickPromises.length){
                processProductsArray(categoryProducts);
            }
        }
        next();
    }
    function listIsAvailable(selector){
        return jQuery(selector).length > 0;
    }
    function loadClickPromises(){
        clickPromises = [];
        jQuery('.tabs--facets .tabs--facet-style input[class="facet-checkbox--input"]').each(function(index,elm){
            clickPromises.push(elm);
        })
    }
    optimizely.get('utils').waitUntil(function(){
        return listIsAvailable('.tabs--facets .tabs--facet-style input[class="facet-checkbox--input"]');
    }).then(function(){
        loadClickPromises();
        }).then(function(){
        processArray(runPromiseInSequence)
    }).then(function(){
        console.log("Done processing category products");
    });
}());

function sendToProductsService(){
    console.log("Sending to product service")
    finalRequest = {
        category: gidLib.getQuerystringParam('cid'),
        payload: finalResultData,
        products: productsData
    }

    jQuery.ajax({
    contentType: 'application/json',
    data: JSON.stringify(finalRequest),
    dataType: 'json',
    success: function(data){
        console.warn("sent products to service successfullly");
        jQuery('.tabs--clear-all-button:visible').click();
    },
    error: function(){
        console.warn("sending products to service failed");
        jQuery('.tabs--clear-all-button:visible').click();
    },
    processData: false,
    type: 'POST',
    url: '/insert/products'
});
}


//Function to check if element is json array
function isJsonArray(element) {
  return Object.prototype.toString.call(element).trim() == '[object Array]';
}

//Function to convert json object to json array if it's otherwise it will just return it.
function jsonObjectToArray(element){
  var jsonArray = [];
  if(!isJsonArray(element) && element !== undefined && element !== ""){
    jsonArray.push(element);
  }else {
    jsonArray = element;
  }
  return jsonArray;
}
// removing duplicates
function containsItem (array, value) {
    var doesContain = false;
    if(!array || !value){
        return false;
    }
    if (array[value]) {
        doesContain = true
    }
    return doesContain;
}

// for jean style filter value
function updateJeanStyleArr(result,childProductDetail){
    var jeanStyledata =  result.ProductTags.CategoryTags !=='' && result.ProductTags.CategoryTags !== undefined ? result.ProductTags.CategoryTags : '';
    jeanStyledata = jsonObjectToArray(jeanStyledata);
    if(jeanStyledata.length > 0 ){
        for(var x=0; x<jeanStyledata.length ;x++){
            if(jeanStyledata[x].value == 'Jegging' || jeanStyledata[x].value == 'Skinny' || jeanStyledata[x].value == 'Straight' || jeanStyledata[x].value == 'Girlfriend' || jeanStyledata[x].value == 'Bootcut'){
                var tmp = 'cat_facet_style_'+jeanStyledata[x].value;
                if(typeof finalResultData[tmp] === 'undefined'){
                    finalResultData[tmp] = {};
                }
                var flag = containsItem(finalResultData[tmp],childProductDetail.prodId);
                if(flag === false ){
                    finalResultData[tmp][childProductDetail.prodId] = childProductDetail.prodId;
                    productsData[childProductDetail.prodId] = childProductDetail;
                }
            }
        }
    }
}
// for rise filter value
function updateRiseArr(result,childProductDetail){
    var risedata = result.ProductTags.BoutiqueTags !== '' && result.ProductTags.BoutiqueTags !== undefined ? result.ProductTags.BoutiqueTags :'';
    risedata = jsonObjectToArray(risedata);
    if(risedata.length > 0 ){
        for(var x=0; x<risedata.length ;x++){
            if(risedata[x].value == 'High rise' || risedata[x].value == 'Low rise' || risedata[x].value == 'Mid rise'){
                var tmp = 'cat_facet_rise_'+risedata[x].value;
                tmp = tmp.replace(' ','_');
                if(typeof finalResultData[tmp] === 'undefined'){
                    finalResultData[tmp] = {};
                }
                var flag = containsItem(finalResultData[tmp],childProductDetail.prodId);
                if(flag === false ){
                    finalResultData[tmp][childProductDetail.prodId] = childProductDetail;
                }
            }   
        }
    }
}
// for color filter value
function updateColorArr(result,childProductDetail){
    var rawCol = result;
    if(rawCol !== undefined && rawCol !== '' && rawCol.indexOf(')') > -1){
        rawCol = rawCol.split(')')[0];
        rawCol = rawCol.split('(')[1];
        rawCol = rawCol.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
        var tmp = 'cat_facet_wash_'+rawCol;
        if(typeof finalResultData[tmp] === 'undefined'){
            finalResultData[tmp] = {};
        }
        var flag = containsItem(finalResultData[tmp],childProductDetail.prodId);
        if(flag === false ){
            finalResultData[tmp][childProductDetail.prodId] = childProductDetail;
        }
    }   
}

//Update category filter
function updateCategoryArr(categoryFilter, childProductDetail){
    if(childProductDetail !== undefined){
        var tmp = categoryFilter;
        if(typeof finalResultData[tmp] === 'undefined'){
            finalResultData[tmp] = {};
        } 
        var flag = containsItem(finalResultData[tmp],childProductDetail.prodId);
        if(flag === false ){
            finalResultData[tmp][childProductDetail.prodId] = childProductDetail;
        }
    }    
}

function updateSizeUserName(variantName,sizeOptName,childProductDetail){
    var temp = 'cat_facet_'+variantName+'_'+sizeOptName;
    if(typeof finalResultData[temp] === 'undefined'){
        finalResultData[temp] = {};
    } 
    var flag = containsItem(finalResultData[temp],childProductDetail.prodId);
    if(flag === false ){
        finalResultData[temp][childProductDetail.prodId] = childProductDetail;
    }   
}

// for color filter value
function updateSizeArr(productStyleVariantList,childProductDetail){
    for(var p=0; p<productStyleVariantList.length; p++){
        var variantName = productStyleVariantList[p].variantName;
        var sizeVariantArr = productStyleVariantList[p].productStyleVariantSizeInfo.sizeDimension1SizeOptions;
        if(sizeVariantArr.length > 0){
            for(var q=0; q<sizeVariantArr.length; q++){
                var sizeOptName = sizeVariantArr[q].sizeOptionName;
                updateSizeUserName(variantName,sizeOptName,childProductDetail);
            }
        }
    }
}
// call producttag api
function callProdtagAPI(elm,tempcolor,productStyleVariantList){
    console.log('inside ptag api:'+ elm.businessCatalogItemId);
    var id = elm.businessCatalogItemId;
    var id6dig = id.slice(0,6);
    console.log('id6dig '+id6dig);
    return jQuery.ajax({
        url : "https://www.gap.com/resources/productTags/v1/"+id6dig,
        dataType: 'json',
        success: function(res){
            var childProductDetail = {
                prodId: '',
                prodhref : '',
                frntImg : '',
                bckImg : '',
                prodName :'',
                prodPriceXhtml:''
              };
            childProductDetail.prodId = elm.businessCatalogItemId;
            childProductDetail.prodhref = 'https://www.gap.com/browse/product.do?pid='+elm.businessCatalogItemId;
            childProductDetail.frntImg = elm.categoryLargeImage ? elm.categoryLargeImage.path : '';
            childProductDetail.bckImg = elm.avImages ? elm.avImages.av1QuicklookImagePath : '';
            childProductDetail.prodName = elm.name;
            childProductDetail.prodPriceXhtml = elm.priceFormatXhtml;
            console.log('start PS API Then 2'+childProductDetail.prodName);
            updateJeanStyleArr(res,childProductDetail);
            updateRiseArr(res,childProductDetail);
            updateColorArr(tempcolor,childProductDetail);
            updateSizeArr(productStyleVariantList,childProductDetail);
            //updateCategoryArr(elm.category_filter, childProductDetail);
        }
    }).done(function(ajaxRes){
        var response = ajaxRes;
    }).fail(function(){
        console.log('promise failed')
    });
} 
// call productstyle api
function callProdStyleAPI(elm){
    console.log('inside ps api:'+ elm.businessCatalogItemId);
    var prodId = elm.businessCatalogItemId;
    return jQuery.ajax({
        url : "https://www.gap.com/resources/productStyle/v1/"+prodId,
        dataType: 'json',
        success : function(data){
            var prodStydata = data;
            console.log(data); 
            var productStyleVariantList = [], tempcolor ='';
            if(prodStydata.productStyleV1 !=='undefined' && prodStydata.productStyleV1.productStyleVariantList !=='undefined'){
                productStyleVariantList = jsonObjectToArray(prodStydata.productStyleV1.productStyleVariantList);
                // only checking "regular" variant name for colorName & product url 
                if(productStyleVariantList.length > 0){
                    tempcolor = productStyleVariantList[0].productStyleColors.colorName !== ''? productStyleVariantList[0].productStyleColors.colorName : '';
                    console.log('2 then :'+tempcolor);
                    callProdtagAPI(elm,tempcolor,productStyleVariantList);
                }
            }
        }
    });
}
//parsing selected filter 
function parseEachProd(productid){
    return new Promise((resolve, reject) => {
        console.log("grabbing product details for product: " + productid);
        resolve(callProdStyleAPI(productid));
      });
}