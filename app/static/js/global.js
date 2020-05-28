var currProv='all';
var fullProv='all';
var chart;
function resetMap(){
    $('#vmap').vectorMap({
        map: 'canada_en',
        backgroundColor: null,
        color: '#f4f3f0',
        hoverColor: '#ff99b1',
        selectedColor: '#ff0f47',
        enableZoom: false,
        showTooltip: true,
        onRegionClick:function(event,code,region){
            //console.log("Region:"+region+"\nCode:"+code);
            currProv=code;
            if(code=='ab' || code=='on' || code=='qc'){
                fullProv=region;
                ajaxCall();
                
            }
            else{
                event.preventDefault();
            }
        },
        onLabelShow: function(event, label, code)
        {
            switch(code) {
                case 'nu':
                    label.text('Nunavut');
                  break;
                case 'nt':
                    label.text('Northwest Territories');
                  break;
                case 'yt':
                    label.text('Yukon');
                  break;
                case 'bc':
                    label.text('British Columbia');
                  break;
                case 'ab':
                    label.text('Alberta');
                  break;
                case 'sk':
                    label.text('Saskatchewan');
                  break;
                case 'mb':
                    label.text('Manitoba');
                  break;
                case 'on':
                    label.text('Ontario');
                  break;
                case 'qc':
                    label.text('Quebec');
                  break;
                case 'nl':
                    label.text('Newfoundland and Labrador');
                  break;
                case 'nb':
                    label.text('New Brunswick');
                  break;
                case 'ns':
                    label.text('Nova Scotia');
                  break;
                case 'pe':
                    label.text('Prince Edward Island');
                  break;
                default:
                    event.preventDefault();
            }
        }
    });

    $('#vmap').vectorMap('set', 'colors', {on: '#82abff',ab:'#82abff',qc:'#82abff'});
}

function ajaxCall(){
    $('#chartContainer').html('');
    var fd= new FormData();
    fd.append('prov',currProv);
    fd.append('type','vacancy_covidcases');
    $.ajax({
        type : 'POST',
        url : "chart",
        contentType: false,
        data : fd,
        processData:false,
        success:function(response){
            console.log(response);
            var chartData=[];
            var casesData=[];
            for (var i = 0; i < response['dates'].length; i++) {
                casesData.push({x:new Date(response['dates'][i]), y: response['totCases'][i]});
            }

            chartData.push({
                type:"line",
                axisYType: "primary",
                name: "Covid-19 Cases(per 100k)",
                showInLegend: true,
                markerSize: 0,
                dataPoints: casesData
            });

            
            var vacData=[];
            for (var i = 0; i < response['dates'].length; i++) {
                vacData.push({x:new Date(response['dates'][i]), y: response['vacCount'][i]});
            }
            chartData.push({
                type:"line",
                axisYType: "primary",
                name: "Vacancies",
                showInLegend: true,
                markerSize: 0,
                visible:false,
                dataPoints: vacData
            });
            
            var empData=[];
            for (var i = 0; i < response['dates'].length; i++) {
                empData.push({x:new Date(response['dates'][i]), y: response['empCount'][i]});
            }
            chartData.push({
                type:"line",
                axisYType: "primary",
                name: "# of Employees",
                showInLegend: true,
                markerSize: 0,
                visible:false,
                dataPoints: empData
            });

            var wrkHrData=[];
            for (var i = 0; i < response['dates'].length; i++) {
                wrkHrData.push({x:new Date(response['dates'][i]), y: response['wrkhrCount'][i]});
            }

            chartData.push({
                type:"line",
                axisYType: "primary",
                name: "Worked Hours",
                showInLegend: true,
                markerSize: 0,
                visible:false,
                dataPoints: wrkHrData
            });

            var salesCntData=[];
            for (var i = 0; i < response['dates'].length; i++) {
                salesCntData.push({x:new Date(response['dates'][i]), y: response['salesCount'][i]});
            }

            chartData.push({
                type:"line",
                axisYType: "primary",
                name: "Sales",
                showInLegend: true,
                markerSize: 0,
                visible:false,
                dataPoints: salesCntData
            });

            console.log(chartData)
            
            if(fullProv=='all'){
                fullProv='Canada'
            }

            chart = new CanvasJS.Chart("chartContainer", {
                backgroundColor: "transparent",
                
                title: {
                    text: fullProv,
                    fontColor:'white',
                },
                axisX: {
                    labelFontColor:'white',
                    lineColor: "#cccccc"
                },
                axisY: {
                    includeZero:false,
                    labelFontColor:'white',
                    gridColor: "#cccccc",
                    lineColor: "#cccccc"
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    verticalAlign: "top",
                    horizontalAlign: "center",
                    dockInsidePlotArea: false,
                    itemclick: toogleDataSeries,
                    fontColor: 'white'
                },
                data: chartData
            });
            chart.render();
        }
    });
}

function toogleDataSeries(e){
    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else{
        e.dataSeries.visible = true;
    }
    chart.render();
}

$( document ).ready(function() {

    resetMap();
    

    $("#mapReset").click(function() {
        currProv='all';
        fullProv='all';
        ajaxCall();
        //$('#vmap').html('');
        $('#vmap').remove();
        $( '<div id="vmap" style="width: 600px; height: 400px;"></div>' ).prependTo( "#mapcontainer" );
        resetMap();
    });

    ajaxCall();
});