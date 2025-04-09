<script lang="ts">
    import '../../app.css';
    import AdOctopus from "$lib/AdOctopus.svelte";
	import NavBar from '$lib/NavBar.svelte';

    const navItemClass = "nav-link link-light"
    const navBarClassDefault = "container-fluid mb-2 text-center text-body-secondary";

    let y = 0;
    let navBarClassFollow = navBarClassDefault;
    let navBarPlaceholderTop = 0;

    function updateNavBarPlaceholderTop() {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const navBar = document.getElementById('nav-bar');
            if (navBar) {
                navBarPlaceholderTop = navBar.getBoundingClientRect().top + window.scrollY + navBar.offsetHeight;
            }
        }

        if (navBarPlaceholderTop < 10) {
            navBarPlaceholderTop = 100;
        }
    }

    function onScrollChange() {
        updateNavBarPlaceholderTop();

        if (y > navBarPlaceholderTop) {
            navBarClassFollow = `${navBarClassDefault} border-bottom border-secondary-subtle py-1`;
        } else {
            navBarClassFollow = `${navBarClassDefault} nav-bar-hidden`;
        }
    }

    $: if (y !== undefined) {
        onScrollChange();
    }
</script>

<h1 id="top" class="text-center display-1 fs-1 text-light mx-1 my-2">
    <a href="/" class="link-light link-underline link-underline-opacity-0 link-underline-opacity-100-hover">Agile Octopus Price Tracker</a>
</h1>

<div id="nav-bar" class="{navBarClassDefault}"><NavBar /></div>
<div id="nav-bar-follow" class="{navBarClassFollow}"><NavBar /></div>

<div class="container mb-4 mx-auto">
    <slot />
</div>

<div class="container mb-5 mx-auto">
    <AdOctopus />
    <p class="fs-1 text-center">🐙</p>

    <ul class="nav justify-content-center">
        <li class="nav-item">
            <a class="{navItemClass}" href="/">Home</a>
        </li>
        <li class="nav-item">
            <a class="{navItemClass}" href="/about">About</a>
        </li>
    </ul>
</div>

<svelte:window bind:scrollY={y} />