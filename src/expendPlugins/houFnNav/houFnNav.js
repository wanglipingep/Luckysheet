import locale from '../../locale/locale';
import luckysheetsizeauto from '../../controllers/resize';
import luckysheetConfigsetting from '../../controllers/luckysheetConfigsetting';
import formula from "../../global/formula";
import {replaceHtml} from "../../utils/util";
import {modelHTML} from "../../controllers/constant";
import { setcellvalue } from "../../global/setdata";
import { getRangeWithFlatten, setCellValue} from "../../global/api";

let isInitialHouFnNav = true, updatingSheetFile = null,classList = [],funMap={},dynTableParams={},selectParamsCellId=null;



export function initialEvent(file){
    //confirm houFnNav
    $("#luckysheet-slider-houFnNav-ok").unbind("click").click(function () {
        const rangeWithFlatten = getRangeWithFlatten();
        if(!rangeWithFlatten || rangeWithFlatten.length<=0){
            alert("请选择将公式生成到那个单元格");
            return;
        }
        const Fn_Name = $("#houFnNav-function-names option:selected").text();
        if(!Fn_Name){
            alert("请选择函数名称");
            return;
        }
        let selectParamsArray = [];
        $("#luckysheet-modal-dialog-slider-houFnNav .formulaInputFocus").each(function() {
            const value = $(this).val(); // 或者使用 $(this).val()
            selectParamsArray.push(value?value:'""');
        });
        const params = selectParamsArray.join(",");
        setCellValue(rangeWithFlatten[0].r,rangeWithFlatten[0].c,`=IFUNC("${Fn_Name}",${params})`);
        closeHouFnNavModal();
    });

    //cancel houFnNav
    $("#luckysheet-slider-houFnNav-cancel, #luckysheet-modal-dialog-houFnNav-close").click(function(){
        closeHouFnNavModal();
    });

    // 类别事件
    $("#houFnNav-function-class").unbind("change").change(function (){
        houFnNavFunctionNames();
    })

    // 函数名称事件
    $("#houFnNav-function-names").unbind("change").change(function (){
        houFnNavDynTableParams();
    })
    $(document).off("click.IFsingRange").on("click.IFsingRange", "#luckysheet-modal-dialog-slider-houFnNav .singRange", function(){
        let value = $(this).siblings("input").val();
        selectParamsCellId = $(this).attr("name");
        if(formula.iscelldata(value)){
            singleRangeDialog(value);
        }
        else{
            singleRangeDialog();
        }
    });
    $(document).off("click.IFsingRangeConfirm").on("click.IFsingRangeConfirm", "#luckysheet-HouFnNav-singleRange-confirm", function(){
        $("#luckysheet-formula-functionrange-select").hide();
        $("#luckysheet-HouFnNav-singleRange-dialog").hide();

        let value = $(this).parents("#luckysheet-HouFnNav-singleRange-dialog").find("input").val().trim();
        $(`#luckysheet-modal-dialog-slider-houFnNav #${selectParamsCellId}`).val(value);

    });
    $(document).off("click.IFsingRangeCancel").on("click.IFsingRangeCancel", "#luckysheet-HouFnNav-singleRange-cancel", function(){
        $("#luckysheet-formula-functionrange-select").hide();
        $("#luckysheet-HouFnNav-singleRange-dialog").hide();
    });
    $(document).off("click.IFsingRangeClose").on("click.IFsingRangeClose", "#luckysheet-HouFnNav-singleRange-dialog .luckysheet-modal-dialog-title-close", function(){
        $("#luckysheet-formula-functionrange-select").hide();
        $("#luckysheet-HouFnNav-singleRange-dialog").hide();
    });

}

/**
 * 单元格选择器弹出框
 * @param value
 */
function singleRangeDialog(value){
    $("#luckysheet-modal-dialog-mask").hide();
    $("#luckysheet-HouFnNav-singleRange-dialog").remove();

    const _locale = locale();
    const local_houFnNav = _locale.houFnNav;
    const locale_button = _locale.button;

    if(value == null){
        value = "";
    }

    $("body").append(replaceHtml(modelHTML, {
        "id": "luckysheet-HouFnNav-singleRange-dialog",
        "addclass": "luckysheet-HouFnNav-singleRange-dialog",
        "title": local_houFnNav.ifGenTipSelectCell,
        "content": '<input readonly="readonly" placeholder="'+local_houFnNav.ifGenTipSelectCellPlace+'" value="'+ value +'">',
        "botton": '<button id="luckysheet-HouFnNav-singleRange-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button id="luckysheet-HouFnNav-singleRange-cancel" class="btn btn-default">'+locale_button.cancel+'</button>',
        "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-HouFnNav-singleRange-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
        myh = $t.outerHeight(),
        myw = $t.outerWidth();
    let winw = $(window).width(), winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
    $("#luckysheet-HouFnNav-singleRange-dialog").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 }).show();
}

/**
 * 自定义函数右侧弹出框
 * @param file
 */
function initialHouFnNavRightBar(file){
    const _locale = locale();
    const local_houFnNav = _locale.houFnNav;
    const locale_button = _locale.button;

    const houFnNavModalHtml = `
    <div id="luckysheet-modal-dialog-slider-houFnNav" class="luckysheet-modal-dialog-slider luckysheet-modal-dialog-slider-pivot" style="display: none;">
        <div class="luckysheet-modal-dialog-slider-title"> <span>${local_houFnNav.houFnNavTitle}</span> <span id="luckysheet-modal-dialog-houFnNav-close" title="${locale_button.close}"><i class="fa fa-times" aria-hidden="true"></i></span> </div>
        <div class="luckysheet-modal-dialog-slider-content">  
            <div class="luckysheet-slider-houFnNav-config" style="top:20px;height:80px">
                <div class="luckysheet-slider-houFnNav-row">
                    <div class="luckysheet-houFnNav-label luckysheet-houFnNav-column-4x">
                        <label>${local_houFnNav.classType}:</label>
                    </div>
                    <div class="luckysheet-houFnNav-column-6x">
                        <select id="houFnNav-function-class">
                        </select>
                    </div>
                </div>
                <div class="luckysheet-slider-houFnNav-row">
                    <div class="luckysheet-houFnNav-label luckysheet-houFnNav-column-4x">
                        <label>${local_houFnNav.funName}:</label>
                    </div>
                    <div class="luckysheet-houFnNav-column-6x">
                        <select id="houFnNav-function-names">
                        </select>
                    </div>
                </div>
            </div>
            <div class="luckysheet-slider-houFnNav-config" style="top:100px;height:290px;border-top:1px solid #c5c5c5">
                <div class="luckysheet-slider-houFnNav-row">
                    <div class="luckysheet-houFnNav-header luckysheet-houFnNav-column-4x">
                        <label>${local_houFnNav.headerName}:</label>
                    </div>
                    <div class="luckysheet-houFnNav-header luckysheet-houFnNav-column-6x">
                        <label>${local_houFnNav.headerValue}:</label>
                    </div>
                </div>
                <div id="houFnNav-dyntable-params">
                
                </div>
            </div>
            <div class="luckysheet-slider-houFnNav-config" style="bottom:0px;height:45px">
                <div class="luckysheet-slider-houFnNav-column luckysheet-houFnNav-column-5x" style="left:0px;">
                    <div class="luckysheet-slider-houFnNav-ok" id="luckysheet-slider-houFnNav-ok">
                         ${locale_button.confirm}
                    </div>
                </div>
                <div class="luckysheet-slider-houFnNav-column luckysheet-houFnNav-column-5x" style="left:50%;">
                    <div class="luckysheet-slider-houFnNav-cancel" id="luckysheet-slider-houFnNav-cancel">
                        ${locale_button.cancel}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    $("body").append(houFnNavModalHtml);
}
/**
 * 打开弹出框
 * @param file
 */
export function openHouFnNavModal(file){
    debugger
    if(isInitialHouFnNav){
        initialHouFnNavRightBar(file);
        initialEvent(file);
        isInitialHouFnNav = false;
        houFnNavFunctionClass();
    }

    updatingSheetFile = file;

    // 1、将单元格的公式内容回写到弹出框


    // 2、展示弹出框
    $("#luckysheet-modal-dialog-slider-houFnNav").show();
    luckysheetsizeauto();

}

export function closeHouFnNavModal(){
    $("#luckysheet-modal-dialog-slider-houFnNav").hide();
    luckysheetsizeauto();
}

/**
 * ajax公共方法
 * @param url 请求地址
 * @param data 请求数据
 * @param success 成功方法
 * @param error 失败方法
 * @param method 方法类型 post get
 * @param dataType 文本类型
 */
function getAjax(url, data = {}, success, error,method = 'POST',dataType='application/json;charset=UTF-8') {
    const userInfo = JSON.parse(window.localStorage.getItem('userInfo')).data;
    const currentRoleId = JSON.parse(window.localStorage.getItem('currentRoleId')).data;
    $.ajax({
        method: method,
        url: url,
        async: false,
        headers: {
            credentials: JSON.stringify({"roleId": currentRoleId || ''}),
            token: userInfo == "undefined" ? "" : userInfo == undefined ? "" : userInfo.token
        },
        data: JSON.stringify(data),
        contentType: dataType,
        success(res) {
            success?.(JSON.parse(res))
        },
        error(err) {
            error?.(err)
        }
    })
}

/**
 * 构造option信息
 * @param data
 * @param key
 * @param value
 * @returns {string}
 */
function createOptionHtml(data,key,value) {
    let optionHtml = '';
    for (let i = 0; i < data.length; i++) {
        optionHtml += ` <option value="${data[i][key]}">${data[i][value]}</option>`
    }
    return optionHtml;
}

/**
 * 类别select赋值
 */
function houFnNavFunctionClass() {
    let objHtml = $("#houFnNav-function-class");
    objHtml.empty();
    // 读取类别
    if (classList && classList.length > 0) {
        objHtml.html(createOptionHtml(classList, 'class_id', 'class_name'));
        houFnNavFunctionNames();
    } else {
        getAjax(luckysheetConfigsetting.remoteHost + '/reportServer/function1/getAllFunctionClass', {}, (result) => {
            classList = result.data;
            objHtml.html(createOptionHtml(classList, 'class_id', 'class_name'));
            houFnNavFunctionNames();
        })
    }
}

/**
 *  函数名称select赋值
 */
function houFnNavFunctionNames() {
    $('#houFnNav-function-names').empty();
    const selectValue = $("#houFnNav-function-class").val();
    // 函数名称
    if (funMap[selectValue] && funMap[selectValue].length > 0) {
        $("#houFnNav-function-names").html(createOptionHtml(funMap[selectValue], 'func_id', 'func_name')).val(null);
    } else {
        getAjax(luckysheetConfigsetting.remoteHost + '/reportServer/function1/getFunctionByClassID/' + selectValue, {}, (result) => {
            funMap[selectValue] = result.data;
            $("#houFnNav-function-names").html(createOptionHtml(funMap[selectValue], 'func_id', 'func_name')).val(null);
        })
    }
}

function createHouDynNavParams(selectValue, local_houFnNav) {
    let html = '';
    for (let i = 0; i < dynTableParams[selectValue].length; i++) {
        html += `<div class="luckysheet-slider-houFnNav-row">
                    <div class="luckysheet-houFnNav-header-row luckysheet-houFnNav-column-4x">
                        <label>${dynTableParams[selectValue][i].in_name}</label>
                    </div>
                    <div class="luckysheet-houFnNav-header-row luckysheet-houFnNav-column-6x">
                        <input class="formulaInputFocus" id="houFnNav-table-${dynTableParams[selectValue][i].in_id}" placeholder="${local_houFnNav.selectRange}"/>
                        <i class="singRange fa fa-table" name="houFnNav-table-${dynTableParams[selectValue][i].in_id}" aria-hidden="true" title="${local_houFnNav.selectRange}"></i>
                    </div>
                </div>`;
    }
    return html;
}

function houFnNavDynTableParams() {
    const _locale = locale();
    const local_houFnNav = _locale.houFnNav;
    let dynTableParamsObj = $("#houFnNav-dyntable-params");
    dynTableParamsObj.empty();

    const selectValue = $("#houFnNav-function-names").val();

    if (dynTableParams[selectValue] && dynTableParams[selectValue].length > 0) {
        dynTableParamsObj.html(createHouDynNavParams(selectValue, local_houFnNav));
    } else {
        getAjax(luckysheetConfigsetting.remoteHost + '/reportServer/function1/getFunctionByID/' + selectValue, {}, (result) => {
            dynTableParams[selectValue] = result.data?.in;
            let html = createHouDynNavParams(selectValue, local_houFnNav);
            dynTableParamsObj.html(html);
        })
    }
}
