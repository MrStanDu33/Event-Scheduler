class Event
{
	constructor(data)
	{
		var i = 0;
		while (i < data.length)
		{
			let key = this.getKey(data, i);
			let value = this.getValue(data, i);
			this[key] = value;
			i = i + key.length + value.length + 2;
		}
	}

	getKey(data, i)
	{
		return (data.slice(i, data.indexOf(":", i)));
	}

	getValue(data, i)
	{
		return (data.slice(data.indexOf(":", i) + 1, data.indexOf("\n", i)));
	}
}

class Calendar
{
	constructor(url)
	{
		this.data =  []
		this.events = [];
		$.ajax(
		{
			type: 'GET',
			url: url,
			context: this,
		}).
		done(function(data)
		{
			if (data.length != 0)
			{
				this.data = data;
				this.buildEvents();
			}
		});
	}

	buildEvents()
	{
		var i = this.data.indexOf("BEGIN:VEVENT", i);
		while (this.data.indexOf("BEGIN:VEVENT", i) > 0)
		{
			let start = this.data.indexOf("BEGIN:VEVENT", i) + 14;
			let end = this.data.indexOf("END:VEVENT", start);
			let eventData = this.data.slice(start, end);
			event = new Event(eventData);
			this.events[event.DTSTART.slice(0, event.DTSTART.indexOf("T"))] = event;
			i = i + eventData.length;
		}
	}
}

var calendar = new Calendar("/calendar.ics");
console.log(calendar);