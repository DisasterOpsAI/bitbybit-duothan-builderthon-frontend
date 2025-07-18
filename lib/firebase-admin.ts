import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: "bitbybit-duothan-builderthon",
    private_key_id: "6acb563eae8b3a4c44de95438e82bc72f7638658",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD8Bib3cx5Wnk2u\nGC3z+a0DnpNfHfz/oiZtSiOkEnRiFkSACj7jLHC2CwC9a1jrqWEpznIxQmb/FYsh\n4ubRYylLNvypweOijcQf3WnEkAnmqzRrzldj39XazElthW8mBRs5AKG5QuvdH5ex\nFKnpXXaAXDgZQae4ra1u5v4j+5i/+geFADBMbdrQiNLRxtrnbQ5lCTpA0TwpLG4F\nkqGOh5WDk0oYxaGz6MfuIQcKBmEOC+eNI3J+MCskkSwwVoloJlLLQwhhShKLIRX9\nhJC/ZkDC32KC5BTtkaUd4X0mwCWab/WIkSXpjLoETjHzj1mxMlA1JDu6Ft+abSTm\n57fJuJM7AgMBAAECggEAb9B49FtmT+7PLxj6Nl8FVHBEGTTQXUh/PQjiNDad3TDc\n9mPVT+wVG6dZDjE00+Wjvq0h+9nmoXDY+FFXr/mLRhwg0F4+FQ5JwAt3lCaFxgoa\naWQ0YJLcKkVtpIJJdHhaghlWJ0BaLhKIth+hXPDDFSMVHpuDAsxHgMdKZQOI2079\nJ0pNf+77Kxphtzin9yP0PyTViqz9Du8oBgWITkEln4pHIFHoWMzM+lXI7pzw+9km\ngHxWSZSLm1Y7WKxWLMWAwlk2x6B8ZjvCeBK9eCNHKx4mDW6iayscs/fW74hCYzim\nVhvuYzzpOGnMj1lzTt3FLap4+cbrVHaw0ZvWYG5ZyQKBgQD/nJQ0PDmbemVj6dwk\nKB1pp9aaegfLpInKPquL3mqcNTLq1EPNsiWr8bQq/fmmgs0Car/BJialKd9FVIy1\nnlJFfRyV4ipTeTbKsWIcYWIApoZUfLfXWPxUCu5qVs+0h5QGyl0e608edTRtN8oI\n1WPwa2gTQn5Pq5LTJmA1uXGGIwKBgQD8aC2Jgfck7VOSmjBNSBrsisrFSZNMqJuo\nhDxNu+XymrluYkLcv27lxsGFGtr5cbLarY6VzxmclwSNFfGo2TwBOhyYEzKj6le1\nYxOwdCTpc0ijNpqdAzo29seSbZ6Ej/Jdl43btZtATse9DgVhIFRt0X6lKUBS8Rxn\nAxAAj/F0CQKBgFLcclrAjzgspEOQYxHBg09l3jazimVkkFpkmH29+zdqM3hWmShM\nMNQdhXdOX6ivzD+VVVYKxQpTmZJDB1401Zy7IxIff/MRX0az3AcxNnDZisBGsd34\ndcvUw1brj2eJb94HqcpFI5/PBNDG/hKBAmXEm7dqncG779vNG/EujXObAoGBANW5\nTN3Dm8a74mkfgEjgBlRGzZ2ySDTADFXr6rgTo4kCtIMgVudefYO5AYI4lDRlrwF1\ntmdpnpE2WtcwPpkvoJyVXULz9oxPUQc5JqHiJqM6R8ZT5SWQZwnFeoWlpnUvAhV3\nz9m7dANG8eBGcA2m93apzmgBfwL8QIWFVVZ0jAopAoGAWkI0shfRNNetpv2h1gWm\nHltT1Q7WLjj3O/EEMRgd7ZP1/BtZlmdrm+zhMHacUzlMCcR8l0xMCM4WN7IzXd+p\njVYL/vPxTTsYFNGPar5i4ULiH/Nzuep4L8XNGIu/HPVAyG82WXe1/Rx8/RTJFPBc\nlrwo0HeSPDpF3QcUY8JJ8Tk=\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@bitbybit-duothan-builderthon.iam.gserviceaccount.com",
    client_id: "113761669766995584456",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bitbybit-duothan-builderthon.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminInitialized = true;
export default admin;