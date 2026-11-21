// The client sites I host and run. The hero and the "Client Sites" project both read this list,
// so adding or removing a client here updates the count everywhere.
// `listed: false` counts a site without naming it on the page.
export interface Client {
	name: string;
	url?: string;
	note?: string;
	listed?: boolean;
}

export const CLIENTS: Client[] = [
	{
		name: 'Zur Laterne',
		url: 'https://zur-laterne.com',
		note: 'Restaurant in Duisburg: menu and opening hours from a CMS, and an order page for the festive menu',
	},
	{
		name: 'Ibeji Photography',
		url: 'https://ibejiphotography.com',
		note: 'Multilingual photography portfolio with a blog and gallery the client edits',
	},
	{ name: 'FRINIrents', url: 'https://frinirents.de' },
	{ name: 'Obaa Visuals', url: 'https://obaavisuals.de' },
	{ name: 'ProfiConsult', listed: false },
];

export const LISTED_CLIENTS = CLIENTS.filter((client) => client.listed !== false);

// Update by hand from Umami now and then. Shown as written.
export const WEEKLY_USERS = '1,000+';

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export const countWord = (n: number) => WORDS[n] ?? String(n);
