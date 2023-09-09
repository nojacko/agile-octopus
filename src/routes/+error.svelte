<script>
    import { page } from '$app/stores';
</script>

<div class="container d-flex" style="height: 100vh;">
    <div class="card d-block mx-auto text-center align-self-center">
        <div class="card-body">
            <h1 class="card-title mb-4 display-1">{$page.status}</h1>
            <div class="card-subtitle mb-4 lead">
                {$page.error.message}
            </div>
            <a href="/" class="btn btn-secondary">    
                <i class="fa-solid fa-arrow-left"></i> Back to Home Page
            </a>
        </div>
    </div>
</div>