//VARIABLES
var paragonlvl = 450
var pointsleft = paragonlvl
var dmg = 0
var lif = 0
var arm = 0
var pen = 0
var res = 0
var pot = 0

var dmg_m = 20
var lif_m = 200
var arm_m = 4
var pen_m = 4
var res_m = 4
var pot_m = 4

stats = {dmg,lif,arm,pen,res,pot}
statmults = {dmg_m,lif_m,arm_m,pen_m,res_m,pot_m}

//EVENTS

//FUNCTIONS
function init() {
    $("#points_left").val(pointsleft);
    $("#paragon_level").val(paragonlvl);
    buildTree();
    $('[data-bs-toggle="popover"]').popover();
}

function numonly(e){
    var x = e.which || e.keycode;
    if((x>=48 && x<=57))
        return true;
    else
        return false;
}

function updParagon() {
    var newparagon = $("#paragon_level").val()
    if (newparagon > paragonlvl) {
        var diff = parseInt(newparagon) - parseInt(paragonlvl)
        pointsleft = parseInt(pointsleft) + parseInt(diff)
        $("#points_left").val(pointsleft)
    } else {
       //Reset the Tree (buildTree()?)
       $("#points_left").val(newparagon)
    }
    paragonlvl = $("#paragon_level").val()
    pointsleft = $("#paragon_level").val()
}

function buildTree() {
    $.get('../api/v1/paragontrees/', function(data) {
        for(var t = 0; t < data.length;t++) {
            var sel = false
            var isactive = ""
            var isshow = ""
            if (t == 0) {
                sel = true
                isactive = "active"
                isshow = "show"
            } 
            $("#navtabs").append(`
                <li class="nav-item" role="presentation">
                    <a class="nav-link `+isactive+`" data-bs-toggle="tab" href="#tree`+data[t].treeid+`" role="tab" aria-selected="`+sel+`" tabindex="`+t+`">
                        <div class="d-flex align-items-center">
                            <div class="tab-title">`+data[t].treename+`</div>
                        </div>
                    </a>
                </li>
            `)
            $("#tabcontent").append(`
                <div class="tab-pane fade `+isactive + ` `+ isshow +`" id="tree`+data[t].treeid+`" role="tabpanel">
                <div class="z-n3 position-absolute">
                    <div class="cnrow cnrow0">
                        <div class="cn01to00 cn_hbox cn-none"></div>
                        <div class="cn02to01 cn_hbox cn-none"></div>
                        <div class="cn03to02 cn_hbox cn-none"></div>
                        <div class="cn04to03 cn_hbox cn-none"></div>
                    </div>
                    <div class="cnrow cnrow1">
                        <div class="cn10to00 cn00to10 cn_vbox cn-none"></div>
                        <div class="cn11to01 cn01to11 cn_vbox cn-none"></div>
                        <div class="cn12to02 cn02to12 cn_vbox cn-none"></div>
                        <div class="cn13to03 cn03to13 cn_vbox cn-none"></div>
                        <div class="cn14to04 cn04to14 cn_vbox cn-none"></div>
                    </div>
                    <div class="cnrow cnrow2">
                        <div class="cn11to10 cn_hbox cn-none"></div>
                        <div class="cn12to11 cn_hbox cn-none"></div>
                        <div class="cn13to12 cn_hbox cn-none"></div>
                        <div class="cn14to13 cn_hbox cn-none"></div>
                    </div>
                    <div class="cnrow cnrow1">
                        <div class="cn20to10 cn10to20 cn_vbox cn-none"></div>
                        <div class="cn21to11 cn11to21 cn_vbox cn-none"></div>
                        <div class="cn22to12 cn12to22 cn_vbox cn-none"></div>
                        <div class="cn23to13 cn13to23 cn_vbox cn-none"></div>
                        <div class="cn24to14 cn14to24 cn_vbox cn-none"></div>
                    </div>
                    <div class="cnrow cnrow2">
                        <div class="cn21to20 cn_hbox cn-none"></div>
                        <div class="cn22to21 cn_hbox cn-none"></div>
                        <div class="cn23to22 cn_hbox cn-none"></div>
                        <div class="cn24to23 cn_hbox cn-none"></div>
                    </div>
                </div>
                    <div class="z-1 container container-top"></div>
                </div>
            `)

            var items = data[t].items;
            var prev_x = -1;
            var prev_y = -1;
            var offset = ""
            var hide = "visually-hidden";
            for(var i = 0; i < items.length; i++) {
                var posx = items[i].posx;
                var posy = items[i].posy;
                if (items[i].parentid == 0) {
                    hide = ""
                } else {
                    //hide = "visually-hidden"
                    hide = ""
                }
                if (posy > prev_y) {
                    prev_x = -1;
                    $("#tree" + data[t].treeid + " .container-top").append('<div class="row row'+posy+'"></div>')
                }
                for(x=prev_x;x<posx-1;x++) {
                    $("#tree" + data[t].treeid + " .container-top .row"+posy).append(`<div class="paragon_box"></div>`);
                }
                if(items[i].parentpos) {
                    var parent_line = items[i].parentpos;
                } else {
                    parent_line = "0"
                }
                if (parent_line.indexOf(',') !== -1) {
                    let values = parent_line.split(',');
                    for (let i = 0; i < values.length; i++) {
                        $('#tree'+data[t].treeid+' .'+values[i]).removeClass('cn-none cn-max cn-cur').addClass('cn-off');
                    }
                } else {
                    $('#tree'+data[t].treeid+' .'+parent_line).removeClass('cn-none cn-max cn-cur').addClass('cn-off');
                }
                
                $("#tree" + data[t].treeid + " .container-top .row"+posy).append(`
                    <div class="paragon_box">
                        <div class="position-relative" style="width: 100px;">
                            <a href="#" class="paragon_skill" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover focus" title="` + items[i].pitemname + `" data-content="` + items[i].pitemdesc + `">
                                <div style="background-image:url('/static/images/paragon_icons/`+items[i].pitemicon+`');" id="itemimg_`+items[i].pitemid+`" class="bg-off `+items[i].css_shape+`">
                                </div>
                                <span class="badge rounded-pill bg-danger position-absolute bottom-0 start-50 translate-middle-x">
                                    <span class="curval">0</span> / <span class="maxval">`+items[i].attrmaxvalue+`</span>
                                </span>
                            </a>
                        </div>
                        
                        <div  style="width: 100px;" class="py-1 block btn-group `+hide+`" role="group" aria-label="`+ items[i].pitemname +`" data-ce-itemid="`+items[i].pitemid+`" data-ce-curval="0" data-ce-maxval="`+items[i].attrmaxvalue+`" data-ce-attrname="`+items[i].attrname+`" data-ce-parent="`+items[i].parentid+`"  data-ce-parentline="`+parent_line+`" data-ce-treeid="`+data[t].treeid+`">
                            <button type="button" onclick="calcsub(this,`+items[i].pitemid+`);" class="btn btn-sm btn-dark calcadd"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus-circle text-white"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                            <button type="button" onclick="calcadd(this,`+items[i].pitemid+`);" class="btn btn-sm btn-dark calcsub"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle text-white"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                        </div>                        
                    </div>
                `)
                prev_x = posx;
                prev_y = posy;
            }
        }
    });
}

function resetTree() {
    var roots = $('[data-ce-parent="0"]');
    roots.each(function() {
      var root = $(this);
      var descendants = getDescendants(root.attr('data-ce-itemid'));
      descendants.push(root.attr('data-ce-itemid'));
      descendants.forEach(function(itemid) {
        calcMin(itemid);
      });
    });
  }

function calcadd(el,itemid) {
    var data = $(el).parent('[data-ce-itemid='+itemid+']')
    var mymax = data.attr('data-ce-maxval')
    var mycur = data.attr('data-ce-curval')
    var myparent = data.attr('data-ce-parent')
    if(mycur == mymax) {
        //No points left or Already at Max
        console.log('max reached')
        return;
    } else {
        //Check ancestors and calcmax them
        var lineage = getAncestors(itemid)
        lineage.reverse()
        if(lineage.length == 1) { //We are at a root item
            //addItemPoints(itemid,1)
        } else { //Max the parents first
            for (i=0;i<lineage.length;i++) {
                calcMax(lineage[i])
            }
        }
        addItemPoints(itemid,1)
    }
}

function calcsub(el,itemid) {
    var data = $(el).parent('[data-ce-itemid='+itemid+']')
    var mycur = data.attr('data-ce-curval')
    if(mycur == 0) {
        //Already at 0
        return;
    } else {
        //Check descendants and calcmax them
        lineage = getDescendants(itemid)
        if(lineage.length == 0) { //We are at a root item
            //addItemPoints(itemid,-1)
        } else { //Min the children first
            for (i=0;i<lineage.length;i++) {
                calcMin(lineage[i])
            }
        }
        addItemPoints(itemid,-1)
    }
}

function calcMax(itemid) {
    //Do we have enough points left?
    var curval = $('[data-ce-itemid='+itemid+']').attr('data-ce-curval')
    var maxval = $('[data-ce-itemid='+itemid+']').attr('data-ce-maxval')
    var pts = parseInt(maxval) - parseInt(curval)
    if(pts > pointsleft) {
        var diff = parseInt(pointsleft)
    } else {
        var diff = parseInt(pts)
    }
    addItemPoints(itemid,diff)
}

function calcMin(itemid) {
    var curval = $('[data-ce-itemid='+itemid+']').attr('data-ce-curval')
    var maxval = $('[data-ce-itemid='+itemid+']').attr('data-ce-maxval')
    if(parseInt(curval) !== parseInt(maxval)) {
        var diff = Math.abs(parseInt(curval)) * -1
    } else {
        var diff = Math.abs(parseInt(maxval)) * -1
    }
    addItemPoints(itemid,parseInt(diff))
}

function addTotalPoints(num) {
    pointsleft = parseInt(pointsleft) + parseInt(num);
    $("#points_left").val(pointsleft)
}

function addItemPoints(itemid,num) {
    if(pointsleft==0) {
        alert("Out of points to spend")
        return;
    } else {
        var data = $('[data-ce-itemid='+itemid+']')
        var curval = data.attr('data-ce-curval')
        var maxval = data.attr('data-ce-maxval')
        var mystat = data.attr('data-ce-attrname')
        var parent_line = data.attr('data-ce-parentline')
        var treeid = data.attr('data-ce-treeid')
        newcur = parseInt(curval) + num
        data.attr('data-ce-curval',newcur).trigger('data-change');
        data.closest('.paragon_box').find('.curval').html(newcur)
        //Update CSS (Item & Lines)
        var arrPline = []
        if (parent_line.indexOf(',') !== -1) {
            let values = parent_line.split(',');
            for (let i = 0; i < values.length; i++) {
                arrPline.push(values[i])
            }
        } else {
            arrPline.push(parent_line)
        }
        if(newcur === 0) {
            $('#itemimg_'+itemid).removeClass('bg-cur bg-max').addClass('bg-off')
            for(var n = 0;n < arrPline.length;n++) {
                $('#tree'+treeid+' .'+arrPline[n]).removeClass('cn-none cn-max cn-cur').addClass('cn-off');
            }
        } else if (newcur == parseInt(maxval)) {
            $('#itemimg_'+itemid).removeClass('bg-cur bg-off').addClass('bg-max')
            for(var n = 0;n < arrPline.length;n++) {
                $('#tree'+treeid+' .'+arrPline[n]).removeClass('cn-none cn-off cn-cur').addClass('cn-max');
            }
        } else {
            $('#itemimg_'+itemid).removeClass('bg-off bg-max').addClass('bg-cur')
            for(var n = 0;n < arrPline.length;n++) {
                $('#tree'+treeid+' .'+arrPline[n]).removeClass('cn-none cn-max cn-off').addClass('cn-cur');
            }
        }

        //Update Main Stats
        if (typeof mystat !== undefined) {
            stats[mystat] = parseInt(stats[mystat]) + num * statmults[mystat+"_m"]
            $("#attrval_"+mystat).html("+ " + stats[mystat])
            console.log(stats[mystat])
            if (parseInt(stats[mystat]) > 0 ) {
                $("#attrval_"+mystat).removeClass('bg-primary').addClass('bg-success')
            } else {
                $("#attrval_"+mystat).removeClass('bg-success').addClass('bg-primary')
            }
        }
        var invnum = parseInt(num) * -1
        addTotalPoints(invnum)
    }
}

function getDescendants(itemId) {
    var descendants = [];
    function findDescendants(itemId) {
        var children = $('[data-ce-parent*="' + itemId + '"]');
        children.each(function() {
            var child = $(this);
            var parent = child.attr('data-ce-parent');
            var parentArray = parent.split(',');
            descendants.push(child.attr('data-ce-itemid'));
            for(var i = 0; i < parentArray.length; i++){
                if(parentArray[i] == itemId){
                    findDescendants(child.attr('data-ce-itemid'));
                }
            }
        });
    }
    findDescendants(itemId);
    return descendants;
}

function getAncestors(itemid) {
    let element = $(`[data-ce-itemid='${itemid}']`);
    let ancestors = [];
    while (element.length) {
        let parent = element.attr("data-ce-parent");
        if(parent === "0") break;
        let parentArray = parent.split(',');
        if(parentArray.length > 1){
            let lowestParent = findLeastMaxVal(parentArray[0],parentArray[1]);
            ancestors.push(lowestParent);
            element = $(`[data-ce-itemid='${lowestParent}']`);
        }
        else{
            ancestors.push(parent);
            element = $(`[data-ce-itemid='${parent}']`);
        }
    }
    return ancestors;
}

function findLeastMaxVal(parent1, parent2) {
    let lowestParent = null;
    let lowestTotal = Number.MAX_SAFE_INTEGER;
    let total = 0;
    for (let parent of [parent1, parent2]) {
        let originalParent = parent;
        let currentParent = parent;
        let parentElement = $(`[data-ce-itemid='${currentParent}']`);
        while(parentElement.length){
            total += Number(parentElement.attr("data-ce-maxval"));
            let parentId = parentElement.attr("data-ce-parent");
            if(parentId === "0") break;
            parentElement = $(`[data-ce-itemid='${parentId}']`);
            currentParent = parentId;
        }
        if(total < lowestTotal){
            lowestTotal = total;
            lowestParent = originalParent;
        }
        total = 0;
    }
    return lowestParent;
}