<template>
  <div id="app">
    <nav>
      <router-link to="/">Практика 27</router-link>
      <router-link to="/advanced">Практика 28</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
  padding: 20px;
}

nav {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ddd;
}

nav a {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  border-radius: 5px;
  transition: background 0.3s;
}

nav a:hover {
  background: #eee;
}

nav a.router-link-active {
  background: #667eea;
  color: white;
}
</style>