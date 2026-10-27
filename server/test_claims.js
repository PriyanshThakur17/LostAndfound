// Automated API test for Claims endpoints
import http from 'http';

async function runTests() {
  const { default: app } = await import('../server/server.js');
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5001, resolve));
  console.log('Test server running on port 5001');

  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-student-token',
    };

    // 1. Health check
    const healthRes = await fetch('http://localhost:5001/api/health');
    const healthData = await healthRes.json();
    console.log('✓ Health check passed:', healthData.status);

    // 2. Submit Claim
    const claimRes = await fetch('http://localhost:5001/api/claims', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        itemId: '1',
        claimType: 'ownership_claim',
        verificationAnswers: {
          itemColor: 'White',
          uniqueFeature: 'Small scratch on front case',
          lostLocation: 'Library 2nd floor',
          contactName: 'Test Student',
        },
      }),
    });
    const claimData = await claimRes.json();
    console.log('✓ Submit claim response status:', claimRes.status, 'success:', claimData.success);
    console.log('✓ Claim initial status:', claimData.claim?.status, '(should be Pending)');

    if (claimData.claim?.status !== 'Pending') {
      throw new Error(`Expected claim status to be Pending, got ${claimData.claim?.status}`);
    }

    const claimId = claimData.claim._id || claimData.claim.id;

    // 3. Get My Claims
    const myClaimsRes = await fetch('http://localhost:5001/api/claims/mine', {
      headers: authHeaders,
    });
    const myClaimsData = await myClaimsRes.json();
    console.log('✓ Get my claims count:', myClaimsData.count, 'success:', myClaimsData.success);

    // 4. Update Claim Status (Approve)
    const updateRes = await fetch(`http://localhost:5001/api/claims/${claimId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-admin-token',
      },
      body: JSON.stringify({
        status: 'Approved',
        reviewNotes: 'Verified ownership matching description.',
      }),
    });
    const updateData = await updateRes.json();
    console.log('✓ Update claim response status:', updateRes.status, 'success:', updateData.success);
    console.log('✓ Approved claim status:', updateData.claim?.status, 'itemStatus:', updateData.itemStatus);

    if (updateData.claim?.status !== 'Approved') {
      throw new Error(`Expected claim status to be Approved, got ${updateData.claim?.status}`);
    }

    console.log('====================================');
    console.log('🎉 ALL CLAIM ENDPOINT TESTS PASSED!');
    console.log('====================================');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
