-- CreateTable
CREATE TABLE "NewsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL,
    "lastUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidenceScore" REAL NOT NULL,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "fullReport" TEXT,
    CONSTRAINT "Signal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "bulletPoints" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL,
    CONSTRAINT "Brief_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reliabilityScore" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "Source_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_email_key" ON "Subscription"("email");
