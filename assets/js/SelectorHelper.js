function setValuesOnSelector(selector,value1,value2) {
    var select = document.querySelectorAll(selector);
    for (var i = 0;i < select.length;i++) {
        select[i][value1] = value2;
    }
}