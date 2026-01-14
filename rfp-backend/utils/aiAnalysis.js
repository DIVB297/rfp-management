const OpenAI = require('openai');

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Analyze vendor response using AI
 * @param {Object} rfpData - Original RFP data
 * @param {Object} vendorResponse - Vendor's response data
 * @returns {Object} Analysis results with score and recommendations
 */
const analyzeVendorResponse = async (rfpData, vendorResponse) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  // Format attachments information
  const attachmentsInfo = vendorResponse.attachments && vendorResponse.attachments.length > 0
    ? vendorResponse.attachments.map(att => `${att.filename} (${att.mimetype}, ${(att.size / 1024).toFixed(2)} KB)`).join(', ')
    : 'No attachments';

  const prompt = `
You are an expert procurement analyst. Analyze this vendor response to an RFP and provide a detailed, structured assessment.

RFP DETAILS:
- Project Title: ${rfpData.projectTitle}
- Budget: $${rfpData.budget?.toLocaleString() || 'Not specified'}
- Deadline: ${new Date(rfpData.deadline).toLocaleDateString()}
- Requirements: ${rfpData.requirements}
- Description: ${rfpData.projectDescription}

VENDOR RESPONSE:
- Vendor Name: ${vendorResponse.vendorName}
- Vendor Email: ${vendorResponse.vendorEmail}
- Proposed Price: ${vendorResponse.proposedPrice ? '$' + vendorResponse.proposedPrice.toLocaleString() : 'Not specified'}
- Estimated Timeline: ${vendorResponse.timeline || 'Not specified'}
- Experience: ${vendorResponse.experience || 'Not specified'}
- Team Size: ${vendorResponse.teamSize || 'Not specified'}
- Previous Work: ${vendorResponse.previousWork || 'Not specified'}
- Attachments: ${attachmentsInfo}

EMAIL CONTENT:
- Subject: ${vendorResponse.emailSubject || 'N/A'}
- Body: ${vendorResponse.emailBody ? vendorResponse.emailBody.substring(0, 2000) : vendorResponse.approach || 'N/A'}

Please analyze this vendor response comprehensively and provide:

1. Overall Score (0-100): Rate the vendor's suitability based on:
   - Pricing competitiveness (vs RFP budget)
   - Timeline feasibility (vs deadline)
   - Experience and qualifications
   - Proposal completeness and quality
   - Communication clarity

2. Strengths: List 2-4 key strengths of this proposal (be specific)

3. Weaknesses/Concerns: List 2-4 potential concerns or areas of improvement

4. Budget Analysis: 
   - Compare proposed price with RFP budget
   - Assess if price is competitive, fair, or concerning
   - Note if price is missing

5. Timeline Analysis:
   - Assess if timeline can meet the deadline
   - Note any timeline concerns
   - Mention if timeline is missing

6. Risk Assessment: 
   - Identify potential risks (experience gaps, budget concerns, timeline issues)
   - Rate risk level: Low, Medium, or High

7. Recommendation: Based on analysis, recommend one of:
   - "Highly Recommended" - Excellent fit, minimal concerns
   - "Recommended" - Good fit, minor concerns
   - "Consider with Caution" - Some concerns that need addressing
   - "Not Recommended" - Significant concerns or poor fit

8. Key Insights: 2-3 sentence executive summary

9. Structured Details: Parse and structure the key information for display:
   - Extract core competencies mentioned
   - Identify specific deliverables promised
   - Note any special terms or conditions
   - Highlight unique selling points

Format your response as JSON with this EXACT structure:
{
  "score": 85,
  "recommendation": "Highly Recommended",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "weaknesses": ["Specific concern 1", "Specific concern 2"],
  "budgetAnalysis": "Detailed comparison of proposed price vs RFP budget",
  "timelineAnalysis": "Detailed assessment of timeline vs deadline",
  "riskAssessment": "Detailed risk analysis with risk level",
  "keyInsights": "Executive summary in 2-3 sentences",
  "structuredDetails": {
    "coreCompetencies": ["competency1", "competency2"],
    "deliverables": ["deliverable1", "deliverable2"],
    "specialTerms": "Any special terms or conditions mentioned",
    "uniqueSellingPoints": ["USP1", "USP2"]
  }
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert procurement analyst. Analyze vendor responses to RFPs and provide detailed, objective assessments. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const text = completion.choices[0].message.content;
    const analysis = JSON.parse(text);
    
    return {
      success: true,
      analysis,
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to analyze vendor response: ${error.message}`);
  }
};

/**
 * Compare multiple vendor responses and rank them
 * @param {Object} rfpData - Original RFP data
 * @param {Array} vendorResponses - Array of vendor responses with analyses
 * @returns {Object} Comparative analysis and rankings
 */
const compareVendorResponses = async (rfpData, vendorResponses) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const vendorSummaries = vendorResponses.map((vr, index) => `
VENDOR ${index + 1}: ${vr.vendorEmail}
- Score: ${vr.aiAnalysis?.analysis?.score || 'N/A'}
- Price: $${vr.proposedPrice}
- Timeline: ${vr.timeline}
- Recommendation: ${vr.aiAnalysis?.analysis?.recommendation || 'Not analyzed'}
- Key Strengths: ${vr.aiAnalysis?.analysis?.strengths?.join(', ') || 'N/A'}
`).join('\n');

  const prompt = `
You are an expert procurement consultant. Compare these vendor responses for an RFP and provide a final recommendation.

RFP DETAILS:
- Project Title: ${rfpData.projectTitle}
- Budget: $${rfpData.budget}
- Deadline: ${new Date(rfpData.deadline).toLocaleDateString()}
- Requirements: ${rfpData.requirements}

VENDOR RESPONSES:
${vendorSummaries}

Provide a comparative analysis with:
1. Rankings: Order vendors from best to worst with justification
2. Best Overall: Which vendor is the best choice and why?
3. Best Value: Which vendor offers the best value for money?
4. Lowest Risk: Which vendor has the lowest risk profile?
5. Final Recommendation: Your top recommendation with detailed reasoning
6. Alternative Options: Backup choices if the top choice falls through

Format as JSON:
{
  "rankings": [
    {"vendorEmail": "vendor@email.com", "rank": 1, "reason": "why ranked here"}
  ],
  "bestOverall": "vendor@email.com",
  "bestValue": "vendor@email.com",
  "lowestRisk": "vendor@email.com",
  "finalRecommendation": "detailed recommendation",
  "alternatives": ["vendor2@email.com", "vendor3@email.com"]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert procurement consultant. Compare vendor responses objectively and provide clear recommendations. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const text = completion.choices[0].message.content;
    const comparison = JSON.parse(text);
    
    return {
      success: true,
      comparison,
      comparedAt: new Date()
    };
  } catch (error) {
    console.error('AI Comparison Error:', error);
    throw new Error(`Failed to compare vendors: ${error.message}`);
  }
};

module.exports = {
  analyzeVendorResponse,
  compareVendorResponses
};
