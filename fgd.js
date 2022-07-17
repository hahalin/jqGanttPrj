var self = this;
var jsonData;

// Retrieve JSON Data from file.
$.holdReady(true);
$.ajax({
    type: "GET",
    dataType: 'json',
    url: 'json/OverlappedTasksRendering.json',
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

$(document).ready(function () {
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
            if (this.data.IsOverlapping == true)
                this.element.addClass("redbar_style");
            else
                this.element.addClass("bluebar_style");
        }
        this.refresh = function () {
            this.init();
        }
    }
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
            console.log($GanttChart);
            window.fgd=$GanttChart;
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
        TaskTooltipTemplate: $("#TaskTooltipTemplate").html()
    });

    // To update the Gantt Width & Height based on SampleBrowser, if any.
    if (window.parent && window.parent.FitToWindow) {
        window.parent.FitToWindow();
    }

    

//fgd.data("GanttChart").

//let gd=self.$gantt_container.data("FlexyGantt");

let d=$('#gantt_container').data();

let ds=d['FlexyGantt'];

    
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