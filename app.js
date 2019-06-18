class Event
{
	constructor(data)
	{
		var i = 0;
		while (i < data.length)
		{
			let key = data.slice(i, data.indexOf(":", i));
			let value = data.slice(data.indexOf(":", i) + 1, data.indexOf("\n", i));
			this[key] = value;
			i = i + key.length + value.length + 2;
		}
	}
}

var extend = function ()
{
	var extended = {};
	var deep = false;
	var i = 0;
	var length = arguments.length;
	if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' )
	{
		deep = arguments[0];
		i++;
	}
	var merge = function (obj)
	{
		for ( var prop in obj )
		{
			if ( Object.prototype.hasOwnProperty.call( obj, prop ) )
			{
				if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' )
				{
					extended[prop] = extend( true, extended[prop], obj[prop] );
				}
				else
				{
					extended[prop] = obj[prop];
				}
			}
		}
	};
	for ( ; i < length; i++ )
	{
		var obj = arguments[i];
		merge(obj);
	}
	return extended;
};

var calendar = {};

Object.defineProperty(calendar, 'defaultOptions',
{
	value:
	{
		days: [],
		elementId: null,
		months: [],
		url: null,
		weekend: []
	},
	writable: false,
	enumerable: true,
	configurable: false
});

(function()
{
	window.onload = init;
	function init()
	{
		var customCalendar = function (options)
		{
			this.settings = extend(true, {}, calendar.defaultOptions, options);
			this.container = document.getElementById(this.settings.elementId);
			this.events = [];
			this.setCurrentMonth();
			this.setDaysHeader();
			this.printDays();
			this.setEventData();
		};

		customCalendar.prototype =
		{
			buildEvents: function()
			{
				var i = this.eventData.indexOf("BEGIN:VEVENT", i);
				while (this.eventData.indexOf("BEGIN:VEVENT", i) > 0)
				{
					let start = this.eventData.indexOf("BEGIN:VEVENT", i) + 14;
					let end = this.eventData.indexOf("END:VEVENT", start);
					let eventData = this.eventData.slice(start, end);
					event = new Event(eventData);
					this.events[event.DTSTART.slice(0, event.DTSTART.indexOf("T"))] = event;
					i = i + eventData.length;
				}
			},
		
			setCurrentMonth: function()
			{
				let monthContainer = this.container.getElementsByClassName("month")[0];
				let currentMonth = this.getCurrentMonth();
				monthContainer.innerHTML = currentMonth;
			},
		
			setDaysHeader: function()
			{
				let days = this.container.getElementsByClassName("days")[0].getElementsByTagName("td");
				var i = 0;
				for (let day of days)
				{
					day.innerHTML = this.settings.days[i];
					i ++;
				}
			},
		
			printDays: function()
			{
				let startDay = this.getFirstDayIndex(this.getFirstDayName(new Date()));
				var i = 0;
				var week = 0;
				while ((i - startDay) != this.getLastDayNumber(new Date()))
				{
					if (!(i % 7))
					{
						week = document.createElement("tr");
						this.container.getElementsByTagName("tbody")[0].appendChild(week);
					}
					let day = document.createElement("td");
					if (i >= startDay)
						day.innerHTML = i - startDay + 1;
					if (i - startDay + 1 == this.getDay(new Date()))
						day.classList.add("active");
					if (this.settings.weekend.indexOf(this.settings.days[(i%7)]) !== -1)
						day.classList.add("brand--color--light-grey");
					week.appendChild(day);
					i++;
				}
			},
		
			getCurrentMonth: function()
			{
				return(this.settings.months[(new Date).getMonth()]);
			},
		
			getDay: function(date)
			{
				return(date.getDate());
			},
		
			getFirstDayName: function(day)
			{
				let date = new Date(day);
				let month = date.getMonth();
				let year = date.getFullYear();
				let FirstDay = new Date(year, month, 1);
				return(this.settings.days[FirstDay.getDay() - 1]);
			},
		
			getLastDayNumber: function(date)
			{
				return(new Date(date.getMonth(), date.getYear(), 0).getDate());
			},
		
			getFirstDayIndex: function(day)
			{
				return(this.settings.days.indexOf(day));
			},

			setEventData: function()
			{
				$.ajax(
				{
					type: 'GET',
					url: this.settings.url,
					context: this,
				}).
				done(function(data)
				{
					if (data.length != 0)
					{
						this.eventData = data;
						this.buildEvents();
					}
				});
			},
		}

		calendar = new customCalendar(
		{
			url: "/calendar.ics", 
			elementId: "calendar", 
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			days: ["L", "M", "M", "J", "V", "S", "D"],
			weekend: ["S", "D"]
		});

		console.log(calendar);
	}
})();