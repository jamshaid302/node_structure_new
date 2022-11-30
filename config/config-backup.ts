const config = {
    port: 3000,
    host: "0.0.0.0",
    allowedDomains: ["http://localhost:4200", "http://localhost:3000", "http://localhost"],
    tokenLife: 9999999,
    refreshTokenLife: 9999999,
    sendEmails: true,
    pagination: {
        page_size: 50,
        offset: 0,
        maxLimit: 100
    },
    uploads: {
        path: "/files/",
    },
    commonRules: {
        id: 'required|max:24',
        name: 'required|max:200',
        email: 'required|email|max:150',
        password: ['required', 'min:6', 'max:8'],
        domain: ['required', 'max:100', 'regex:/(https?:\/\/)?(www\.)?[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,3})?/'],
        date: 'required|date',
        imageCaption: 'required',
    },
}

export default config;