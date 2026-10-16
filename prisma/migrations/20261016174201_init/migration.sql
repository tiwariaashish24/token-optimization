-- CreateTable
CREATE TABLE "Optimization" (
    "id" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "optimizedText" TEXT NOT NULL,
    "originalTokens" INTEGER NOT NULL,
    "optimizedTokens" INTEGER NOT NULL,
    "tokenReduction" INTEGER NOT NULL,
    "reductionPercentage" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL,
    "technique" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Optimization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsage" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationHistory" (
    "id" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptimizationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Optimization_createdAt_idx" ON "Optimization"("createdAt");

-- CreateIndex
CREATE INDEX "Optimization_model_idx" ON "Optimization"("model");

-- CreateIndex
CREATE INDEX "Optimization_technique_idx" ON "Optimization"("technique");

-- CreateIndex
CREATE INDEX "TokenUsage_date_idx" ON "TokenUsage"("date");

-- CreateIndex
CREATE INDEX "TokenUsage_model_idx" ON "TokenUsage"("model");

-- CreateIndex
CREATE INDEX "OptimizationHistory_savedAt_idx" ON "OptimizationHistory"("savedAt");
