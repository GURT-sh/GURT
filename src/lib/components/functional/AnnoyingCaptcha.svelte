<script lang="ts">
	import Panel from "../visual/Panel.svelte";
	import { RefreshCw } from "lucide-svelte";

	type Props = {
		onComplete: () => void;
	};

	const { onComplete }: Props = $props();

	let captchaAttempts = $state(0);
	let showError = $state(false);
	let errorMessage = $state("");
	let isVerifying = $state(false);
	let verifyButtonText = $state("Verify");

	let mathAnswer = $state("");
	let mathProblem = $state("");
	let correctMathAnswer = $state(0);

	const generateMathProblem = () => {
		const isHard = Math.random() < 0.15;
		
		if (isHard) {
			const hardProblems = [
				() => {
					const base = Math.floor(Math.random() * 8) + 2;
					const exp = Math.floor(Math.random() * 3) + 3;
					const result = Math.pow(base, exp);
					return { question: `${base}^${exp} = ?`, answer: result };
				},
				() => {
					const num = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225][Math.floor(Math.random() * 14)];
					const result = Math.sqrt(num);
					return { question: `√${num} = ?`, answer: result };
				},
				() => {
					const a = Math.floor(Math.random() * 15) + 10;
					const b = Math.floor(Math.random() * 15) + 10;
					const c = Math.floor(Math.random() * 15) + 10;
					const result = a * b + c;
					return { question: `${a} × ${b} + ${c} = ?`, answer: result };
				},
				() => {
					const num = Math.floor(Math.random() * 80) + 120;
					const percent = [15, 20, 25, 30, 35][Math.floor(Math.random() * 5)];
					const result = Math.floor(num * percent / 100);
					return { question: `${percent}% of ${num} = ?`, answer: result };
				},
				() => {
					const a = Math.floor(Math.random() * 12) + 8;
					const b = Math.floor(Math.random() * 12) + 8;
					const result = a * b;
					return { question: `${a} × ${b} = ?`, answer: result };
				}
			];
			const problemGenerator = hardProblems[Math.floor(Math.random() * hardProblems.length)];
			const problem = problemGenerator();
			mathProblem = problem.question;
			correctMathAnswer = problem.answer;
		} else {
			const easyProblems = [
				() => {
					const a = Math.floor(Math.random() * 50) + 30;
					const b = Math.floor(Math.random() * 50) + 20;
					const result = a + b;
					return { question: `${a} + ${b} = ?`, answer: result };
				},
				() => {
					const a = Math.floor(Math.random() * 80) + 50;
					const b = Math.floor(Math.random() * 40) + 10;
					const result = a - b;
					return { question: `${a} - ${b} = ?`, answer: result };
				},
				() => {
					const a = Math.floor(Math.random() * 10) + 5;
					const b = Math.floor(Math.random() * 10) + 5;
					const result = a * b;
					return { question: `${a} × ${b} = ?`, answer: result };
				},
				() => {
					const divisors = [2, 3, 4, 5, 6, 8, 10, 12];
					const divisor = divisors[Math.floor(Math.random() * divisors.length)];
					const quotient = Math.floor(Math.random() * 15) + 5;
					const dividend = divisor * quotient;
					return { question: `${dividend} ÷ ${divisor} = ?`, answer: quotient };
				}
			];
			const problemGenerator = easyProblems[Math.floor(Math.random() * easyProblems.length)];
			const problem = problemGenerator();
			mathProblem = problem.question;
			correctMathAnswer = problem.answer;
		}
	};

	const loadChallenge = () => {
		generateMathProblem();
		mathAnswer = "";
		showError = false;
	};

	let initialized = $state(false);

	$effect(() => {
		if (!initialized) {
			loadChallenge();
			initialized = true;
		}
	});

	const verify = async () => {
		isVerifying = true;
		verifyButtonText = "Verifying...";
		
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		const correct = parseInt(mathAnswer) === correctMathAnswer;

		captchaAttempts++;

		if (!correct) {
			showError = true;
			const errors = [
				"Incorrect. Please try again.",
				"Almost! Try one more time.",
				"That's not quite right.",
			];
			errorMessage = errors[Math.floor(Math.random() * errors.length)];
			isVerifying = false;
			verifyButtonText = "Verify";
			setTimeout(() => loadChallenge(), 1500);
			return;
		}

		if (captchaAttempts === 1) {
			showError = true;
			errorMessage = "Verification expired. Please try again.";
			isVerifying = false;
			verifyButtonText = "Verify";
			setTimeout(() => loadChallenge(), 1500);
			return;
		}

		verifyButtonText = "Success!";
		await new Promise(resolve => setTimeout(resolve, 800));
		onComplete();
	};
</script>

<Panel class="p-6 flex flex-col gap-4 max-w-md mx-auto">
	<div class="flex items-center gap-2">
		<div class="w-8 h-8 bg-accent rounded flex items-center justify-center">
			<RefreshCw size="16" class="text-on-accent" />
		</div>
		<h3 class="text-lg font-semibold">Verify you are human</h3>
	</div>

	<p class="text-sm text-muted">Solve this math problem</p>

	<div class="flex flex-col gap-3">
		<div class="text-center text-2xl font-mono p-4 bg-panel-alt rounded-lg">
			{mathProblem}
		</div>
		<input
			type="number"
			bind:value={mathAnswer}
			placeholder="Enter your answer"
			class="w-full p-3 rounded-lg bg-panel-alt border-2 border-separator focus:border-accent outline-none"
		/>
	</div>

	{#if showError}
		<div class="text-failure text-sm text-center">
			{errorMessage}
		</div>
	{/if}

	<button
		class="btn highlight w-full"
		onclick={verify}
		disabled={isVerifying || !mathAnswer}
	>
		{verifyButtonText}
	</button>

	<p class="text-xs text-muted text-center">
		Attempt {captchaAttempts + 1} • This helps protect our service
	</p>
</Panel>