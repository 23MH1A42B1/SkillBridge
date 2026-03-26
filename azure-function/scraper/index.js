module.exports = async function (context, req) {
    const { query, location, count } = req.body || {};
    const SERP_API_KEY = process.env.SERP_API_KEY;

    if (!query) {
        context.res = {
            status: 400,
            body: { error: "Query parameter is required." }
        };
        return;
    }

    try {
        if (!SERP_API_KEY) {
            context.res = {
                status: 500,
                body: { error: "SERP API Key not configured." }
            };
            return;
        }

        const url = new URL("https://serpapi.com/search.json");
        url.searchParams.append("engine", "google_jobs");
        url.searchParams.append("q", query);
        if (location) url.searchParams.append("location", location);
        url.searchParams.append("api_key", SERP_API_KEY);
        url.searchParams.append("hl", "en");

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.error) {
            context.res = { status: 500, body: data };
            return;
        }

        const results = data.jobs_results || [];
        const limit = count || 10;
        const normalizedJobs = results.slice(0, limit).map(job => ({
            jobId: job.job_id,
            title: job.title,
            company: job.company_name,
            location: job.location,
            source: job.via,
            salary: job.extensions?.find(e => e.includes('₹') || e.includes('$')) || null,
            experience: job.extensions?.find(e => e.includes('year') || e.includes('yr')) || null,
            url: job.related_links?.[0]?.link || null,
            // Mock extracted skills for demonstration, since SERP API job description requires extra deep fetch
            requiredSkills: req.body.query.split(' '),
            preferredSkills: ['Problem Solving', 'Communication']
        }));

        context.res = {
            status: 200,
            body: {
                jobs: normalizedJobs,
                total: normalizedJobs.length,
                source: 'SERP API Google Jobs'
            }
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: { error: "Failed to fetch jobs from SERP API" }
        };
    }
};
