var self = this;
var jsonData;

// Retrieve JSON Data from file.
$.holdReady(true);
$.ajax({
    type: "GET",
    dataType: 'json',
    url: 'fgd.json',
    converters:
    {
        "text json": function (data) {
            return $.parseJSON(data, true /*converts date strings to date objects*/, true /*converts ISO dates to local dates*/);
        }
    },
    success: function (data) {
        self.jsonData = data;
        $.holdReady(false);
    },
    error: function (jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
        console.log(errorThrown);
        self.jsonData = [];
        $.holdReady(false);
    },
});

var $gantt_container;
// SetViewHeight will be called by a containing sample browser, if any.
function SetViewHeight(height) {
    if ($gantt_container && $gantt_container.data("FlexyGantt")) {
        $gantt_container.data("FlexyGantt").setHeight(height);
        $("#pagecontent").height(height);
    }
}
var itype=1;
$(document).ready(function () {

    $('#btna').on('click',function(){

        let g= $('#gantt_container').data();
        let ds=g.FlexyGantt.options.DataSource
        g.FlexyGantt.UpdateDatasource(ds);

        return;

        $gantt_container.FlexyGantt({
            DataSource: self.jsonData
        });

    });

    insertIsOverlappingObject(self.jsonData);
    // Determine the time the timeline in the gantt should scroll to.
    var anchorTime = new Date(2020, 03, 02, 00, 00, 00);

    // The template that defines the look for the parent task bars.
    var pTemplate = "<div class='rq-gc-parentBar'><div  class='rq-taskbar-dragThumb'></div><div  class='rq-taskbar-resizeThumb rq-fg-gc-taskBarResizer'></div><div class='rq-gc-parentBar-leftCue'></div><div class='rq-gc-parentBar-middle'></div><div class='rq-gc-parentBar-rightCue'></div></div>";

    // The template that defines the look for the task bars. "rq-gc-taskbar" is a built-in style that defines a default look for the task bars.
    var tTemplate = "<div class= 'rq-gc-taskbar' data-bind='OverlappingBinder:IsOverlapping'><div  class='rq-taskbar-dragThumb'></div><div class='rq-taskbar-resizeThumb'></div><div class='start-resizeThumb'></div></div>";
    $gantt_container = $("#gantt_container");
    // Initialize the FlexyGantt widget.
    var columns = [
        {
            field: "Name",
            title: "Name",
            editor: RadiantQ.Default.Template.FlexyGanttExpandableTextBoxEditor("nameConverter"),
            template: RadiantQ.Default.Template.FlexyGanttExpandableTextBlockTemplate("nameConverter")
        }];
    // Binder to handle the overlapped taskbars. 
    
    RadiantQ.Binder.OverlappingBinder = function ($elem, role, value, data) {
        this.element = $elem;
        this.value = value;
        this.data = data;

        this.init = function () {
            this.element.removeClass("bluebar_style");
            this.element.removeClass("redbar_style");
            if (this.data.runQty === true)
            {
                //console.log(this);
                //$(this.element).removeAttr('style');
                //this.element.addClass("moveQtyBar");
                
                
            }
                //this.element.addClass("redbar_style");
            //else
                //this.element.addClass("bluebar_style");

        }
        this.refresh = function () {
            this.init();
        }
    }

    insertIsOverlappingObject(self.jsonData);

    $gantt_container.FlexyGantt({
        DataSource: self.jsonData,
        //the FlexyGantt is bound to  resolve the hierarchy of Team/Resources/Tasks.
        resolverFunction: function (data) {
            if (data["Resources"] != undefined) {
                return data["Resources"];
            }
            return null;
        },
        GanttChartTemplateApplied: function (sender, args) {
            var $GanttChart = args.element;
            //console.log($GanttChart);
            window.fgd = $GanttChart;
            $GanttChart.GanttChart({ AnchorTime: anchorTime });
            $GanttChart.GanttChart({ AnchorTime: new Date('2020/04/05') });
        },
        TaskStartTimeProperty: "StartTime",
        ParentTaskStartTimeProperty: "PStartTime",
        TaskItemTemplate: tTemplate,
        ParentTaskItemTemplate: pTemplate,
        GanttTableOptions: {
            columns: columns
        },
        TaskEndTimeProperty: "EndTime",
        ParentTaskEndTimeProperty: "PEndTime",
        TasksListProperty: "Tasks",
        OverlappedTasksRenderingOptimization: RadiantQ.FlexyGantt.OverlappedTasksRenderingOptimization.ShrinkHeight,
        TaskTooltipTemplate: $("#TaskTooltipTemplate").html(),
        RowHeightBinding:
        {
            Property: 'MaxOverlappingBlocksRowCount',
            Converter: function (value) {
                //return value *22;
                return value * (22 + ((value + 1) * 2));
            }
        },
        OnTaskBarLoad: function (sender, tr) {
            var taskBar = sender.options;
            var data = this[0].DataContext;
            //console.log(data.runQty);
            //this.css('display', 'none');
            this.css('height',20);
            if (data.runQty===true)
            {
                $('.parentStyle', $(this)).remove();
                $(this).addClass("moveQtyBar");
                return;
                console.log(this);

                $(this).css({
                    "background-color": 'white',
                    "background-image":'none',
                    'border-radius':0,
                    'margin-top':24,
                    'height':15
                });

            }
            
        },
    });

    // To update the Gantt Width & Height based on SampleBrowser, if any.
    if (window.parent && window.parent.FitToWindow) {
        window.parent.FitToWindow();
    }



    //fgd.data("GanttChart").

    //let gd=self.$gantt_container.data("FlexyGantt");

    let d = $('#gantt_container').data();

    let ds = d['FlexyGantt'];


});

// to get the name from the bounded list
function nameConverter(flexyNodeData, value) {
    var data;
    // The grid calls this converter with flexyNodeData as a arg.
    if (flexyNodeData.Data)
        data = flexyNodeData.Data();
    // The grid calls this converter with flexyNodeData as a datacontext.
    else
        data = flexyNodeData;
    if (value == undefined) {
        if (data["TName"] != undefined)
            return data["TName"];
        else if (data["RName"] != undefined)
            return data["RName"];
        else if (data["TaskName"] != undefined)
            return data["TaskName"];
    }
    else {
        if (data["TName"] != undefined)
            return data["TName"] = value;
        else if (data["RName"] != undefined)
            return data["RName"] = value;
        else if (data["TaskName"] != undefined)
            return data["TaskName"] = value;
    }
    return;
}

// to get the short time format.
var toolTipDateformat = Date.CultureInfo.formatPatterns.shortDate + '  ' + "HH:mm:ss";
function startTimeTooltipConverter(data) {
    if (data["PStartTime"])
        return data["PStartTime"].toString(toolTipDateformat);
    else if (data["StartTime"])
        return data["StartTime"].toString(toolTipDateformat);
    return null;
}

function endTimeTooltipConverter(data) {
    if (data["PEndTime"])
        return data["PEndTime"].toString(toolTipDateformat);
    else if (data["EndTime"])
        return data["EndTime"].toString(toolTipDateformat);
    return null;
}
function insertIsOverlappingObject(jsonData) {
    for (var tIndex = 0; tIndex < jsonData.length; tIndex++) {
        var resources = jsonData[tIndex].Resources;
        if (resources) {
            for (var rIndex = 0; rIndex < resources.length; rIndex++) {
                tasks = resources[rIndex].Tasks;
                if (tasks) {
                    for (var index = 0; index < tasks.length; index++) {
                        tasks[index]["IsOverlapping"] = null;
                        // It gets triggered on changing IsOverlapping property.
                        RadiantQ.Gantt.Utils.InsertPropertyChangedTriggeringProperty(tasks[index], ["IsOverlapping"], true);
                    }
                }
            }
        }
    }
}

/*

let g= $('#gantt_container').data();
//g.FlexyGantt.SetStartTime(new Date('2020/04/05'));
//g.FlexyGantt.TrySetEndTime(new Date('2020/04/07'));
let ds=g.FlexyGantt.options.DataSource.map(n=>n);
ds.forEach(n=>{
    n.Resources.forEach(r=>{
      
      r.Tasks=r.Tasks.filter(t=>{
        
        return (new Date(t.StartTime)) - (new Date('2020/4/6'))>0;
      });
      //console.log(r.Tasks);  
  });
});
//console.log(ds);
g.FlexyGantt.UpdateDatasource(ds);

*/

/*

Math.round
Math.trunc
Math.ceil
Math.floor

let t0=new Date();
let t=new Date(t0.valueOf());
t.setHours(0);t.setMinutes(0);t.setSeconds(0);
console.log(t0);
console.log((t0-t)/(60));
*/