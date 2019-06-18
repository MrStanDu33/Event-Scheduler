class Event
{
	constructor(data)
	{
		var i = 0;
		while (i < data.length)
		{
			let key = data.slice(i, data.indexOf(":", i));
			let endValue = data.indexOf("\n", i)
			while (data[endValue + 1] === " ")
				endValue = data.indexOf("\n", endValue + 1)
			let value = data.slice(data.indexOf(":", i) + 1, endValue);
			this[key] = value;
			i = i + key.length + value.length + 2;
		}
		let startDate = this.DTSTART.substr(0, this.DTSTART.indexOf("T"));
		let endDate = this.DTSTART.substr(0, this.DTSTART.indexOf("T"));
		this.start = {};
		this.start.year = startDate.substr(0, 4);
		this.start.month = startDate.substr(4, 2);
		this.start.day = startDate.substr(6, 2);
		this.end = {};
		this.end.year = endDate.substr(0, 4);
		this.end.month = endDate.substr(4, 2);
		this.end.day = endDate.substr(6, 2);
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
		weekend: [],
		altColorClass: "",
		CORSProxy: false,
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
			if (this.settings.CORSProxy)
				this.settings.url = "/app.php?CORSProxy="+encodeURIComponent(this.settings.url);
			this.container = document.getElementById(this.settings.elementId);
			this.events = [];
			this.setCurrentYear();
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
		
			setCurrentYear: function()
			{
				this.container.getElementsByTagName("table")[0].dataset.year = "2019";
			},
		
			setCurrentMonth: function()
			{
				this.container.getElementsByTagName("table")[0].dataset.month =  this.getCurrentMonth();
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
						day.classList.add(this.settings.altColorClass);
					day.dataset.day = i - startDay + 1;
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
						this.insertEvents();
					}
				});
			},

			insertEvents: function()
			{
				this.events.forEach(event =>
				{
					if (	event.start.year == this.container.getElementsByTagName("table")[0].dataset.year &&
						this.settings.months[Number(event.start.month) - 1] == this.container.getElementsByTagName("table")[0].dataset.month)
					{
						let day = this.container.querySelector('td[data-day="'+Number(event.start.day)+'"]');
						day.classList.add("event");
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
			weekend: ["S", "D"],
			altColorClass: "brand--color--light-grey",
			CORSProxy: false,
		});

		console.log(calendar);
	}
})();