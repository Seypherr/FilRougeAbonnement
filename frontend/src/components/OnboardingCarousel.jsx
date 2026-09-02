import { useMemo, useState } from "react";
import { getBrowserCurrency, getBrowserTimeZone, getCurrencyLabel, SUPPORTED_CURRENCIES } from "../utils/international.js";

export function OnboardingCarousel({ t, language, onComplete }) {
  const questions = t.onboardingQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [preferredCurrency, setPreferredCurrency] = useState(getBrowserCurrency);
  const [submitting, setSubmitting] = useState(false);
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id] ?? "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressLabel = `${currentIndex + 1}/${questions.length}`;
  const progressAriaLabel = t.onboardingProgressLabel
    .replace("{current}", currentIndex + 1)
    .replace("{total}", questions.length);

  const completionPayload = useMemo(() => {
    return questions.reduce((payload, question) => {
      payload[question.id] = answers[question.id] ?? "";
      return payload;
    }, {});
  }, [answers, questions]);

  const chooseAnswer = (answer) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const continueOnboarding = async () => {
    if (!selectedAnswer) {
      return;
    }

    if (isLastQuestion) {
      setSubmitting(true);
      try {
        await onComplete({
          ...completionPayload,
          preferredLanguage: language,
          preferredCurrency,
          timeZone: getBrowserTimeZone(),
          reminderEmailEnabled: true,
          reminderDaysBefore: [7, 3, 1]
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  return (
    <main className="min-h-[100svh] bg-[#F6F7FB] text-[#1B1D28]" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
      <section className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
        <div className="flex shrink-0 gap-2" aria-label={progressAriaLabel}>
          {questions.map((question, index) => (
            <span
              key={question.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-[#7047EB]" : index < currentIndex ? "bg-[#B8A8F7]" : "bg-[#DDE1EA]"}`}
            />
          ))}
        </div>

        <div className="flex flex-1 items-center py-8">
          <article className="onboarding-card-enter w-full rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)]">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full bg-[#F4F1FF] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#7047EB]">
                {currentQuestion.kicker}
              </span>
              <span className="text-xs font-black text-[#8E95A9]">{progressLabel}</span>
            </div>

            <h1 className="text-[28px] font-black leading-tight tracking-normal text-[#1B1D28]">
              {currentQuestion.question}
            </h1>

            {currentIndex === 0 && (
              <label className="mt-5 block text-sm font-bold text-slate-700">
                {t.currencyQuestion}
                <select
                  aria-label={t.currencyQuestion}
                  value={preferredCurrency}
                  onChange={(event) => setPreferredCurrency(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF]"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency} - {getCurrencyLabel(currency, language)}</option>)}
                </select>
              </label>
            )}

            <div className="mt-7 grid gap-3">
              {currentQuestion.options.map((option) => {
                const selected = option === selectedAnswer;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseAnswer(option)}
                    aria-pressed={selected}
                    className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-extrabold transition-all active:scale-[0.99] ${selected ? "border-[#7047EB] bg-[#7047EB] text-white shadow-[0_16px_30px_-20px_rgba(112,71,235,0.9)]" : "border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] hover:border-[#CFC7FA] hover:bg-white"}`}
                  >
                    <span>{option}</span>
                    <span className={`grid size-6 place-items-center rounded-full border text-[10px] ${selected ? "border-white/40 bg-white text-[#7047EB]" : "border-[#DDE1EA] bg-white text-transparent"}`}>
                      <i className="ph-bold ph-check" />
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <button
          type="button"
          disabled={!selectedAnswer || submitting}
          onClick={continueOnboarding}
          className="mb-[max(0px,env(safe-area-inset-bottom))] flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#7047EB] px-5 text-base font-black text-white shadow-[0_18px_38px_-24px_rgba(112,71,235,0.95)] transition-all hover:bg-[#5E35D9] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#C9CDE0] disabled:shadow-none"
        >
          {submitting ? t.loading : isLastQuestion ? t.onboardingFinish : t.onboardingContinue}
          <i className={`ph-bold ${isLastQuestion ? "ph-check" : "ph-arrow-right"} text-lg`} />
        </button>
      </section>
    </main>
  );
}
