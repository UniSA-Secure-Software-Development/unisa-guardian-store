module.exports = {
  // Called by ESLint
  meta: {
    type: "suggestion",
    docs: {
        description: "Suggests where Rate limiters should be used on endpoints",
    },
    fixable: "code",
    schema: [] // no options
  },
  create(context) {
    return {
      
      // Runs whenever a function is called in the syntax
      CallExpression(node) {
        // Check if the function being called uses GET, PUT, POST, DELETE
        const isExpressMethod = node.callee.type === 'MemberExpression' &&
          (node.callee.property.name === 'get' || node.callee.property.name === 'post' || node.callee.property.name === 'put' || node.callee.property.name === 'delete')
        
        if (isExpressMethod) {
          if (node.arguments.length > 1) {
            const route = node.arguments[0].value
            const middleware = node.arguments[1] // Should be rate limiter

            if (typeof(route) === 'string') {
              // Heurustics to Check for a dangerous keyword endpoint that is brute forcible
              const dangerousRoute =
              route.indexOf('login') !== -1 ||
              route.indexOf('user') !== -1 ||
              route.indexOf('password') !== -1 ||
              route.indexOf('2fa') !== -1
              route.indexOf('authenticate') !== -1 ||
              route.indexOf('authentication') !== -1

              // Check if the route might be dangerous (i.e., authentication-related)
              if (dangerousRoute) {
                // Check if the middleware is a call to RateLimit
                const isRateLimitCall = middleware.type === 'NewExpression'
                  && middleware != null && middleware.callee != null && middleware.callee.name === 'RateLimit'
                              
                // Confirm whether it was a rate limit call used
                if (isRateLimitCall) {
                  // Check if options are provided for the rate limiter
                  const options = middleware.arguments[0]; // The object passed to RateLimit
                  if (options && options.type === 'ObjectExpression') {
                    // Check that the right attributes are used
                    const hasMaxAttribute = options.properties.some(prop => prop.key.name === 'max') 
                    const hasWindowMsAttribute = options.properties.some(prop => prop.key.name === 'windowMs')
                        
                    if (!hasMaxAttribute || !hasWindowMsAttribute) {
                      context.report({
                        node,
                        message: `Possible dangerous authentication endpoint '${route}'. Missing the RateLimit attributes 'max' and 'windowMs.'`
                      })
                    }
                  } else {
                    context.report({
                      node,
                      message: `No options provided for rate limiter in possible authentication endpoint '${route}'. Specify attributes 'max' and 'windowMs.'`
                    })
                  }
                } else {
                  context.report({
                    node,
                    message: `Possible dangerous authentication endpoint '${route}'. Missing a rate limiter for the endpoint.`
                  })
                }
              }
            }

            
          }
        }
      }
    }
  }
};