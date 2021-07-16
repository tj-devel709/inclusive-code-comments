import regeneratorRuntime from "regenerator-runtime";

describe('Test extension', () => {

    it('Text Analytics library loads', () => {
        const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
        const client = new TextAnalyticsClient("<endpoint>", new AzureKeyCredential("Not a real API key at all"));
        expect(client).to.be.not.null;
    });

    const server_url = "https://westus.api.cognitive.microsoft.com/";
    const api_key = "PUT REAL KEY HERE";
    const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
    const client = new TextAnalyticsClient(server_url, new AzureKeyCredential(api_key));

    it('Negative sentiment', async () => {
        const [result] = await client.analyzeSentiment(["This is terrible!"]);
        expect(result.sentences[0].sentiment).to.be.equal("negative");
    });

    it('Positive sentiment', async () => {
        const [result] = await client.analyzeSentiment(["This is great!"]);
        expect(result.sentences[0].sentiment).to.be.equal("positive");
    });

    it('Neutral sentiment', async () => {
        const [result] = await client.analyzeSentiment(["Hello World!"]);
        expect(result.sentences[0].sentiment).to.be.equal("neutral");
    });
});