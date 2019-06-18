(function()
{
	window.onload = init;
	function init()
	{
		var calendar = CalendarFrameWork(
		{
			url: "https://openclassrooms.com/fr/calendars/6782494-1f8c9dbaeb5201e6062869890ee57173.ics",
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			days: ["L", "M", "M", "J", "V", "S", "D"],
			weekend: ["S", "D"],
			CORSProxy: true,
			calendarId: "calendar",
			monthContainerId: "month",
			eventContainer: "eventContainer",
		});

		console.log(calendar);
	}
})();