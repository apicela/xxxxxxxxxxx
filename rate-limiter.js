/**
 * Rate Limiter - Janela Deslizante
 * 
 * Implemente os métodos abaixo seguindo as especificações do README.md
 */

class RateLimiter {
  /**
   * @param {number} maxRequests - Número máximo de requisições permitidas
   * @param {number} windowSeconds - Janela de tempo em segundos
   */
  constructor(maxRequests, windowSeconds) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
    this.requests = new Map();
  }

  /**
   * Tenta registrar uma requisição para o usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} { allowed: boolean, retryAfter?: number }
   */
  tryRequest(userId) {
    const now = Date.now();
    this._removeExpiredRequests(userId, now);
    const requestsFromUser = this.requests.get(userId) || [];

    if(requestsFromUser.length < this.maxRequests){
      requestsFromUser.push(now);
      this.requests.set(userId, requestsFromUser)
      return { allowed : true}
    }
    const data = this.getStats(userId);
    const retryAfter = data.nextAvailable - now;
    return { allowed : false, retryAfter : retryAfter}
  }

  /**
   * Limpa o histórico de requisições de um usuário
   * @param {string} userId - ID do usuário
   */
  reset(userId) {
    this.requests.delete(userId);
  }

  /**
   * Retorna estatísticas do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} { requests: number, nextAvailable: number }
   */
  getStats(userId) {
    // TODO: Implementar
    const now = Date.now();
    this._removeExpiredRequests(userId, now);
     const requestsFromUser = this.requests.get(userId) || [];
    let nextAvailable = now;

    if (requestsFromUser.length >= this.maxRequests) {
        nextAvailable = requestsFromUser[0] + this.windowSeconds * 1000;
    }
    return {
      requests: requestsFromUser.length,
      nextAvailable
    };
  }

  _removeExpiredRequests(userId, now){
    const requestsFromUser = this.requests.get(userId);
    if (!requestsFromUser) return;

    const expiredTiming = now - this.windowSeconds;
    while (requestsFromUser.length > 0 && requestsFromUser[0] <= expiredTiming ) {
      requestsFromUser.shift();
    }
  }
}

// ========== CASOS DE TESTE ========== //
// Execute este arquivo com Node.js para validar sua implementação

const limiter = new RateLimiter(3, 10); // 3 requisições a cada 10 segundos

console.log('\n Teste 1: Permite até o limite');
console.log(limiter.tryRequest('user1')); // Esperado: { allowed: true }
console.log(limiter.tryRequest('user1')); // Esperado: { allowed: true }
console.log(limiter.tryRequest('user1')); // Esperado: { allowed: true }
console.log(limiter.tryRequest('user1')); // Esperado: { allowed: false, retryAfter: ~10 }

console.log('\n Teste 2: Usuários independentes');
console.log(limiter.tryRequest('user2')); // Esperado: { allowed: true }

console.log('\n Teste 3: Janela deslizante (aguarde 11 segundos...)');
setTimeout(() => {
  console.log(limiter.tryRequest('user1')); // Esperado: { allowed: true }
  console.log('Teste de janela deslizante concluído!');
}, 11000);

console.log('\n Teste 4: Reset');
limiter.reset('user1');
console.log(limiter.tryRequest('user1')); // Esperado: { allowed: true }

console.log('\n Teste 5: Estatísticas');
console.log(limiter.getStats('user1')); // Esperado: { requests: 1, nextAvailable: <timestamp> }

console.log('\n Aguardando teste assíncrono...\n');