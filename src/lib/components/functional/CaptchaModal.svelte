<script lang="ts">
	import { fade, fly } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import type { Snippet } from "svelte";

	type Props = {
		onclose: () => void;
		children: Snippet;
	};

	const { onclose, children }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4"
	in:fade={{ duration: 200 }}
	out:fade={{ duration: 200 }}
>
	<div
		class="absolute inset-0 bg-black/50 backdrop-blur-sm"
		onclick={onclose}
	></div>
	<div
		class="relative z-10 w-full max-w-md"
		in:fly={{
			duration: 300,
			easing: quintOut,
			y: 50,
		}}
		out:fly={{
			duration: 200,
			easing: quintOut,
			y: -50,
		}}
	>
		{@render children()}
	</div>
</div>