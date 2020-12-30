<h1 align="center">
Reddit
</h1>
<p align="center">
I use reddit pretty often, and I was looking for a project to work on during winter break. I decided to go through Ben Awad's <a href="https://www.youtube.com/watch?v=I6ypD7qv3Z8&t=40168s">full stack tutorial</a>. I made changes to the UI so that it would reflect the actual reddit website. Overall, this project really helped me understand how to frontend and backend components work together. 
</p>

<h1 align="center">
🏋️ Tech Stack
</h1>

## Backend
### Apollo GraphQL
According to the <a href="https://www.apollographql.com/docs/apollo-server/schema/schema/#:~:text=Your%20GraphQL%20server%20uses%20a,execute%20against%20your%20data%20graph.">Apollo docs</a> a schema defines a hierarchy of types with fields that are populated from your back-end data stores. I use GraphQL in order to run CRUD operations on my database. I use Code-first development - defining the resolver first then defining the Schema because it works well with typescript. I used the <a href="https://typegraphql.com/">Type-GraphQL</a> library for Code-first development.

### TypeORM
Using <a href="https://typeorm.io/#/">TypeORM</a> with TypeGraphQL is very helpful for keeping everything in sync. By definition, I must define a schema for 1. GraphQL and 2. my database. Having an ORM (Object-relational Mapper) allows me to map objects into my postgresQL database.

### Redis
<a href="https://redis.io/">Redis</a> uses key value pairings similar to a hashmap.
```req.session.userId: ``` I use Reddis to store user sessions The keys refer to sess:[x] and the value sent back is {userId: x}. When used in combination with Express, express-session sets an encrypted cookie on my browser that represent the key we send to Redis. When a user makes a requet, the cookie is decrypted back into the Redis sess form which will be used in the Redis hashmap. <br/>

### Express
<a href="https://expressjs.com/">Express</a> is a middleware technology. I use it in conjunction with <a href="https://www.apollographql.com/docs/apollo-server/#:~:text=Apollo%20Server%20is%20an%20open,use%20data%20from%20any%20source.">Apollo-Server</a>. I can use ```req.session``` to store any values I want. For Example, I use req.session to store userId's when a user logins or registers. I could store the whole User object in req.session, however, I changed the User object several times during this project.

## Frontend
### NextJS
<a href="https://nextjs.org/">NextJS</a> is really fun to use. They make routing really simple.

### Chakra React
<a href="https://chakra-ui.com/">Chakra</a> helps build faster React Components :) 

### Urql
<a href="https://formidable.com/open-source/urql/">Urql</a> helps me makes GraphQL requests from the frontend. I can also toggle on Server-side rendering or Client-side rendering. I use <a href="https://formidable.com/open-source/urql/docs/graphcache/">GraphCache</a> in order to update cache. I use cache in order to update the query on the frontend whenever I make a Mutation (login, register, posts).

### GraphQL Code Generator
<a href="https://graphql-code-generator.com/">GraphQL Code Generator</a> integrates React and GraphQL seamlessly. I am able to create React Hooks and allow me to access GraphQL resolvers.
