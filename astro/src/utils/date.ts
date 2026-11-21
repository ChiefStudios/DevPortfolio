const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// "2026-06-04" -> "4 Jun 2026"
export const formatDate = (isoDate: string) => fmt.format(new Date(`${isoDate}T00:00:00Z`));

// Posts dated in the future stay hidden until a build on or after that day. `astro dev` shows everything.
export const isPublished = (isoDate: string) =>
	import.meta.env.DEV || isoDate <= new Date().toISOString().slice(0, 10);
