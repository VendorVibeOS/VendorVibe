export class GeminiGradeLocalCoach {
  constructor() {
    this.conversationState = {
      lastTopic: null,
      frustrationLevel: 0
    };
  }

  evaluate(userQuery, dbMetrics = {}) {
    const text = userQuery.trim().toLowerCase();
    
    const metrics = {
      sales: dbMetrics.sales || 0,
      net: dbMetrics.net || 0,
      cash: dbMetrics.cash || 0
    };

    const marginPercentage = metrics.sales > 0 
      ? ((metrics.net / metrics.sales) * 100).toFixed(1) 
      : "0.0";

    // 1. Repetitive Feedback Detection
    if (this._testPatterns(text, ["redundant", "paulit-ulit", "pareho"])) {
      return {
        reply: "Na-detect ko na paulit-ulit ang nakukuhang feedback. Subukang i-update ang iyong sales o expense logs.",
        suggestedPrompts: [
          "Paano ang tamang pagkuwenta ng singil per hour?",
          "Bakit mababa ang aking net income?",
          "Paano protektahan ang aking working capital?"
        ]
      };
    }

    // Dynamic bizType detection para sa lahat ng uri ng negosyo
    const rawBiz = JSON.stringify(metrics || {}).toLowerCase();
    const isTutor = rawBiz.includes('tutor') || rawBiz.includes('education') || rawBiz.includes('teacher') || (!rawBiz.includes('service') && !rawBiz.includes('retail'));

    // 3. Hourly Rate & Pricing Optimization Engine
    if (this._testPatterns(text, ["per hour", "hourly", "rate", "singil"])) {
      const numberMatch = text.match(/\d+/);
      const quotedRate = numberMatch ? parseFloat(numberMatch[0]) : 200;

      let customMathBlock = "";

      if (isTutor) {
        // TUTOR SPECIFIC ANALYSIS
        const estStudents = 5;
        const weeklyHoursPerStudent = 3;
        const monthlyGross = quotedRate * estStudents * weeklyHoursPerStudent * 4;
        const netEstimate = monthlyGross * 0.85; // 15% materials/transpo overhead

        customMathBlock = `\n\n📊 **PAGSUSURI SA ₱${quotedRate}/HOUR TUTORIAL RATE**\n` +
          `• **Gross Monthly Estimate:** ~₱${monthlyGross.toLocaleString()} (batay sa ${estStudents} estudyante, 3 hrs/week bawat isa).\n` +
          `• **Estimated Net Income:** ~₱${netEstimate.toLocaleString()} (matapos ang 15% materials & transpo overhead).\n` +
          `• **Prep Time Factor:** Tandaan na ang 1 oras na klase ay may kasamang ~30 mins na paghahanda ng lesson plans at worksheets na walang bukod na bayad.\n` +
          `• **Rekomendasyon:** Ang ₱${quotedRate}/hr ay magandang base rate sa 1-on-1. Para tumaas ang kita nang hindi nadaragdagan ang oras, mag-offer ng Small Group Tutorials (3-5 students sa ₱150/hr bawat isa).`;
      } else {
        // DEFAULT / SERVICE FREELANCER ANALYSIS
        const billableHours = 96;
        const grossMonthly = quotedRate * billableHours;
        const netEstimate = grossMonthly * 0.7;

        customMathBlock = `\n\n📊 **PAGSUSURI SA ₱${quotedRate}/HOUR RATE**\n` +
          `• **Gross Monthly Potential:** ₱${grossMonthly.toLocaleString()} (batay sa 96 billable hours/mo at 60% capacity).\n` +
          `• **Estimated Net Income:** ₱${netEstimate.toLocaleString()} (matapos i-bawas ang 30% operational overhead).\n` +
          `• Ang natitirang 40% ng oras ay napupunta sa admin at sales marketing na walang direct pay.`;
      }

      return {
        reply: `${customMathBlock}\n\n📐 **THE FINANCIAL FORMULA:**\n` +
          (isTutor 
            ? `Effective Rate = Inaasahang Kita ÷ (Teaching Hours + Prep Hours)\n\n🧠 **THE TUTOR MINDSET:**\nIwasan ang pagbibigay ng libreng sobrang oras nang walang bayad.`
            : `Minimum Rate = (Kailangan mong Sahod + Monthly Overhead) ÷ (Total Hours × 0.60 Billable Capacity).\n\n🧠 **THE FOUNDER PSYCHOLOGY:**\nIwasan ang Loss Aversion o pagtanggap ng mababang presyo dahil sa takot na mawalan ng kliyente.`)
      };
    }

    // 4. Default Dynamic Fallback
    return {
      reply: `Upang mabigyan kita ng ekspertong payo ukol sa "${userQuery}", aling parte ng iyong negosyo ang gusto mong suriin natin?`,
      suggestedPrompts: [
        "Pricing & Labor Rates (Singil per hour/service)",
        "Profit Margins & Expenses (Kuwenta ng net income)",
        "Working Capital & Cash Flow Management"
      ]
    };
  }

  _testPatterns(input, keywords) {
    return keywords.some(kw => input.includes(kw));
  }
}