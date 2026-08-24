"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
var common_1 = require("@nestjs/common");
var stripe_1 = require("stripe");
var BillingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BillingService = _classThis = /** @class */ (function () {
        function BillingService_1(prisma, config) {
            this.prisma = prisma;
            this.config = config;
            this.logger = new common_1.Logger(BillingService.name);
            this.PROMO_PRICE_CENTS = 999; // $9.99 for 30 days of promotion
            this.PROMO_DURATION_DAYS = 30;
            this.RATE_LIMITS = {
                BASIC: { rpm: 100, burst: 20 },
                PRO: { rpm: 1000, burst: 100 },
                ENTERPRISE: { rpm: 10000, burst: 500 },
            };
            var key = this.config.get('app.stripeSecretKey') || process.env.STRIPE_SECRET_KEY;
            if (key) {
                this.stripe = new stripe_1.default(key, { apiVersion: '2026-05-27.dahlia' });
            }
        }
        BillingService_1.prototype.getPlans = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.subscriptionPlan.findMany({
                            where: { active: true },
                            orderBy: { price: 'asc' },
                        })];
                });
            });
        };
        BillingService_1.prototype.createCheckoutSession = function (userId, planSlug, successUrl, cancelUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var plan, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })];
                        case 1:
                            plan = _a.sent();
                            if (!plan)
                                throw new common_1.NotFoundException('Plan not found');
                            if (!this.stripe)
                                throw new common_1.BadRequestException('Stripe not configured');
                            return [4 /*yield*/, this.stripe.checkout.sessions.create({
                                    mode: 'subscription',
                                    payment_method_types: ['card'],
                                    line_items: [{ price_data: {
                                                currency: 'usd',
                                                product_data: { name: plan.name, description: plan.description || undefined },
                                                unit_amount: plan.price,
                                                recurring: { interval: plan.interval },
                                            }, quantity: 1 }],
                                    metadata: { userId: userId, planId: plan.id },
                                    success_url: successUrl,
                                    cancel_url: cancelUrl,
                                })];
                        case 2:
                            session = _a.sent();
                            return [2 /*return*/, { url: session.url }];
                    }
                });
            });
        };
        BillingService_1.prototype.createPortalSession = function (userId, returnUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var user, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { stripeCustomerId: true },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.stripeCustomerId))
                                throw new common_1.BadRequestException('No active subscription');
                            if (!this.stripe)
                                throw new common_1.BadRequestException('Stripe not configured');
                            return [4 /*yield*/, this.stripe.billingPortal.sessions.create({
                                    customer: user.stripeCustomerId,
                                    return_url: returnUrl,
                                })];
                        case 2:
                            session = _a.sent();
                            return [2 /*return*/, { url: session.url }];
                    }
                });
            });
        };
        BillingService_1.prototype.getSubscription = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.subscription.findUnique({
                            where: { userId: userId },
                            include: { plan: true },
                        })];
                });
            });
        };
        BillingService_1.prototype.getBillingHistory = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, invoices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.stripe)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                    select: { stripeCustomerId: true },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.stripeCustomerId))
                                return [2 /*return*/, []];
                            return [4 /*yield*/, this.stripe.invoices.list({
                                    customer: user.stripeCustomerId,
                                    limit: 12,
                                })];
                        case 2:
                            invoices = _a.sent();
                            return [2 /*return*/, invoices.data.map(function (inv) { return ({
                                    id: inv.id,
                                    amount: inv.amount_paid,
                                    currency: inv.currency,
                                    status: inv.status,
                                    date: new Date(inv.created * 1000).toISOString(),
                                    pdf: inv.invoice_pdf,
                                }); })];
                    }
                });
            });
        };
        BillingService_1.prototype.handleStripeWebhook = function (rawBody, signature) {
            return __awaiter(this, void 0, void 0, function () {
                var webhookSecret, event, _a, session, invoice, sub, sub, pi;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            webhookSecret = this.config.get('app.stripeWebhookSecret') || process.env.STRIPE_WEBHOOK_SECRET;
                            if (!this.stripe || !webhookSecret) {
                                throw new common_1.BadRequestException('Stripe not configured');
                            }
                            try {
                                event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
                            }
                            catch (_c) {
                                throw new common_1.BadRequestException('Invalid webhook signature');
                            }
                            _a = event.type;
                            switch (_a) {
                                case 'checkout.session.completed': return [3 /*break*/, 1];
                                case 'invoice.paid': return [3 /*break*/, 3];
                                case 'customer.subscription.updated': return [3 /*break*/, 5];
                                case 'customer.subscription.deleted': return [3 /*break*/, 7];
                                case 'payment_intent.succeeded': return [3 /*break*/, 9];
                            }
                            return [3 /*break*/, 11];
                        case 1:
                            session = event.data.object;
                            return [4 /*yield*/, this.handleCheckoutCompleted(session)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 3:
                            invoice = event.data.object;
                            return [4 /*yield*/, this.handleInvoicePaid(invoice)];
                        case 4:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 5:
                            sub = event.data.object;
                            return [4 /*yield*/, this.handleSubscriptionUpdated(sub)];
                        case 6:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 7:
                            sub = event.data.object;
                            return [4 /*yield*/, this.handleSubscriptionDeleted(sub)];
                        case 8:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 9:
                            pi = event.data.object;
                            return [4 /*yield*/, this.handlePaymentIntentSucceeded(pi)];
                        case 10:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/, { received: true }];
                    }
                });
            });
        };
        BillingService_1.prototype.handleCheckoutCompleted = function (session) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, planId, subscriptionId, stripeSub, plan;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                            planId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId;
                            if (!userId || !planId || !session.subscription)
                                return [2 /*return*/];
                            subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                            return [4 /*yield*/, this.stripe.subscriptions.retrieve(subscriptionId)];
                        case 1:
                            stripeSub = _c.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { stripeCustomerId: session.customer },
                                })];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, this.prisma.subscriptionPlan.findUnique({ where: { id: planId } })];
                        case 3:
                            plan = _c.sent();
                            if (!plan)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.subscription.upsert({
                                    where: { userId: userId },
                                    update: {
                                        planId: planId,
                                        stripeSubscriptionId: subscriptionId,
                                        status: 'ACTIVE',
                                        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                                        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                                    },
                                    create: {
                                        userId: userId,
                                        planId: planId,
                                        stripeSubscriptionId: subscriptionId,
                                        status: 'ACTIVE',
                                        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                                        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                                    },
                                })];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { creatorTier: plan.tier },
                                })];
                        case 5:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BillingService_1.prototype.handleInvoicePaid = function (invoice) {
            return __awaiter(this, void 0, void 0, function () {
                var invAny, subId, sub, stripeSub;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            invAny = invoice;
                            if (!invAny.subscription)
                                return [2 /*return*/];
                            subId = typeof invAny.subscription === 'string' ? invAny.subscription : invAny.subscription.id;
                            return [4 /*yield*/, this.prisma.subscription.findUnique({
                                    where: { stripeSubscriptionId: subId },
                                })];
                        case 1:
                            sub = _a.sent();
                            if (!sub)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.stripe.subscriptions.retrieve(subId)];
                        case 2:
                            stripeSub = _a.sent();
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { id: sub.id },
                                    data: {
                                        status: 'ACTIVE',
                                        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                                        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BillingService_1.prototype.handleSubscriptionUpdated = function (subscription) {
            return __awaiter(this, void 0, void 0, function () {
                var sub, subAny, status;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { stripeSubscriptionId: subscription.id },
                            })];
                        case 1:
                            sub = _a.sent();
                            if (!sub)
                                return [2 /*return*/];
                            subAny = subscription;
                            status = subAny.status === 'active' ? 'ACTIVE'
                                : subAny.status === 'past_due' ? 'PAST_DUE'
                                    : subAny.status === 'canceled' ? 'CANCELED'
                                        : 'EXPIRED';
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { id: sub.id },
                                    data: {
                                        status: status,
                                        currentPeriodStart: new Date(subAny.current_period_start * 1000),
                                        currentPeriodEnd: new Date(subAny.current_period_end * 1000),
                                        cancelAtPeriodEnd: subAny.cancel_at_period_end,
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BillingService_1.prototype.handleSubscriptionDeleted = function (subscription) {
            return __awaiter(this, void 0, void 0, function () {
                var sub;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { stripeSubscriptionId: subscription.id },
                            })];
                        case 1:
                            sub = _a.sent();
                            if (!sub)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { id: sub.id },
                                    data: { status: 'CANCELED' },
                                })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: sub.userId },
                                    data: { creatorTier: 'FREE' },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BillingService_1.prototype.promoteProject = function (userId, projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            if (project.authorId !== userId)
                                throw new common_1.ForbiddenException('Not your project');
                            if (!this.stripe)
                                throw new common_1.BadRequestException('Stripe not configured');
                            return [4 /*yield*/, this.stripe.checkout.sessions.create({
                                    mode: 'payment',
                                    payment_method_types: ['card'],
                                    line_items: [{ price_data: {
                                                currency: 'usd',
                                                product_data: { name: 'Project Promotion - 30 days' },
                                                unit_amount: this.PROMO_PRICE_CENTS,
                                            }, quantity: 1 }],
                                    metadata: { userId: userId, projectId: projectId, type: 'promotion' },
                                    success_url: "".concat(this.getWebUrl(), "/mod/").concat(project.slug, "?promoted=1"),
                                    cancel_url: "".concat(this.getWebUrl(), "/dashboard/projects/").concat(projectId),
                                })];
                        case 2:
                            session = _a.sent();
                            return [2 /*return*/, { url: session.url }];
                    }
                });
            });
        };
        BillingService_1.prototype.createDonation = function (donorId, recipientId, amount, message, anonymous) {
            return __awaiter(this, void 0, void 0, function () {
                var user, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (amount < 100)
                                throw new common_1.BadRequestException('Minimum donation is $1.00');
                            if (donorId === recipientId)
                                throw new common_1.BadRequestException('Cannot donate to yourself');
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: recipientId } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.NotFoundException('Recipient not found');
                            if (!this.stripe)
                                throw new common_1.BadRequestException('Stripe not configured');
                            return [4 /*yield*/, this.stripe.checkout.sessions.create({
                                    mode: 'payment',
                                    payment_method_types: ['card'],
                                    line_items: [{ price_data: {
                                                currency: 'usd',
                                                product_data: { name: "Donation to ".concat(user.username) },
                                                unit_amount: amount,
                                            }, quantity: 1 }],
                                    metadata: {
                                        donorId: donorId,
                                        recipientId: recipientId,
                                        message: message || '',
                                        anonymous: anonymous ? '1' : '0',
                                        type: 'donation',
                                    },
                                    success_url: "".concat(this.getWebUrl(), "/user/").concat(user.username, "?donated=1"),
                                    cancel_url: "".concat(this.getWebUrl(), "/user/").concat(user.username),
                                })];
                        case 2:
                            session = _a.sent();
                            return [2 /*return*/, { url: session.url }];
                    }
                });
            });
        };
        BillingService_1.prototype.handlePaymentIntentSucceeded = function (paymentIntent) {
            return __awaiter(this, void 0, void 0, function () {
                var meta;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            meta = paymentIntent.metadata;
                            if (!((meta === null || meta === void 0 ? void 0 : meta.type) === 'promotion' && meta.projectId)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.promotedProject.upsert({
                                    where: { projectId: meta.projectId },
                                    update: { endsAt: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000), active: true, stripePaymentIntentId: paymentIntent.id },
                                    create: { projectId: meta.projectId, endsAt: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000), stripePaymentIntentId: paymentIntent.id },
                                })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: meta.projectId },
                                    data: { promotedUntil: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000) },
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            if (!((meta === null || meta === void 0 ? void 0 : meta.type) === 'donation' && meta.donorId && meta.recipientId)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.donation.create({
                                    data: {
                                        amount: paymentIntent.amount,
                                        donorId: meta.donorId,
                                        recipientId: meta.recipientId,
                                        message: meta.message || null,
                                        anonymous: meta.anonymous === '1',
                                        stripePaymentIntentId: paymentIntent.id,
                                    },
                                })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        BillingService_1.prototype.getRateLimitForApiKey = function (apiKeyId) {
            return __awaiter(this, void 0, void 0, function () {
                var key, tier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.apiKey.findUnique({
                                where: { id: apiKeyId },
                                select: { rateLimitTier: true },
                            })];
                        case 1:
                            key = _a.sent();
                            tier = (key === null || key === void 0 ? void 0 : key.rateLimitTier) || 'BASIC';
                            return [2 /*return*/, this.RATE_LIMITS[tier]];
                    }
                });
            });
        };
        BillingService_1.prototype.upgradeApiKey = function (userId, apiKeyId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, tier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId }, select: { creatorTier: true } })];
                        case 1:
                            user = _a.sent();
                            if ((user === null || user === void 0 ? void 0 : user.creatorTier) === 'FREE')
                                throw new common_1.ForbiddenException('Upgrade to Creator tier to increase API limits');
                            tier = (user === null || user === void 0 ? void 0 : user.creatorTier) === 'PRO' ? 'PRO' : 'BASIC';
                            return [4 /*yield*/, this.prisma.apiKey.update({
                                    where: { id: apiKeyId },
                                    data: { rateLimitTier: tier },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { rateLimitTier: tier }];
                    }
                });
            });
        };
        BillingService_1.prototype.getWebUrl = function () {
            return this.config.get('app.webUrl') || process.env.WEB_URL || 'http://localhost:3003';
        };
        return BillingService_1;
    }());
    __setFunctionName(_classThis, "BillingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BillingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BillingService = _classThis;
}();
exports.BillingService = BillingService;
