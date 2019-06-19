(function()
{
	window.onload = function()
	{
		var calendar = calendarFrameWork(
		{
			url: "/calendar.ics",
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			days: ["L", "M", "M", "J", "V", "S", "D"],
			weekend: ["S", "D"],
			CORSProxy: false,
			calendarId: "calendar",
			monthContainerId: "month",
			eventContainerId: "eventContainer",
			onDayClick: function()
			{
				//calendar.getEvent(this);
			},
			prevMonthClick: function()
			{

			},
			nextMonthClick: function()
			{

			},
		});
		console.log(calendar);
	};
})();